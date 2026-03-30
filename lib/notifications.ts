import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { AlertMode, Reminder } from '../constants/reminderTypes';
import { logger } from './logger';

const ANDROID_CHANNEL_ID = 'buzz-reminders';

interface NotificationPayload {
  reminderId?: string;
  kind?: string;
  alertMode?: AlertMode;
}

function behaviorForAlertMode(mode: AlertMode | undefined): {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
} {
  const m = mode ?? 'both';
  if (m === 'silent') {
    return { shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false };
  }
  if (m === 'vibrate') {
    return { shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false };
  }
  if (m === 'sound') {
    return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false };
  }
  return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false };
}

if (Platform.OS !== 'web' && typeof Notifications.setNotificationHandler === 'function') {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as NotificationPayload;
      return behaviorForAlertMode(data.alertMode);
    },
  });
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof globalThis === 'undefined' || !('Notification' in globalThis)) {
      return false;
    }
    const NotificationCtor = (
      globalThis as unknown as { Notification?: { permission: string; requestPermission?: () => Promise<string> } }
    ).Notification;
    if (!NotificationCtor) return false;
    if (NotificationCtor.permission === 'granted') return true;
    if (typeof NotificationCtor.requestPermission === 'function') {
      const result = await NotificationCtor.requestPermission();
      return result === 'granted';
    }
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function alertModeToSoundVibrate(alertMode: Reminder['alertMode']): {
  shouldPlaySound: boolean;
  shouldVibrate: boolean;
} {
  switch (alertMode) {
    case 'sound':
      return { shouldPlaySound: true, shouldVibrate: false };
    case 'vibrate':
      return { shouldPlaySound: false, shouldVibrate: true };
    case 'both':
      return { shouldPlaySound: true, shouldVibrate: true };
    case 'silent':
    default:
      return { shouldPlaySound: false, shouldVibrate: false };
  }
}

const webTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function cancelWebTimer(id: string): void {
  const t = webTimers.get(id);
  if (t !== undefined) {
    clearTimeout(t);
    webTimers.delete(id);
  }
}

async function scheduleWebReminder(reminder: Reminder): Promise<string[]> {
  const ids: string[] = [];
  const due = new Date(reminder.dueAt).getTime();
  const delay = Math.max(0, due - Date.now());
  const id = `web-${reminder.id}-${Date.now()}`;
  const t = setTimeout(() => {
    webTimers.delete(id);
    try {
      const GN = (globalThis as unknown as { Notification?: typeof Notification }).Notification;
      if (GN && GN.permission === 'granted') {
        // eslint-disable-next-line no-new
        new GN(reminder.title, { body: 'Reminder due', tag: reminder.id });
      }
    } catch (e) {
      logger.warn('Web notification failed', e);
    }
  }, delay);
  webTimers.set(id, t);
  ids.push(id);
  return ids;
}

export async function scheduleNotificationsForReminder(
  reminder: Reminder
): Promise<{ notificationIds: string[]; criticalRepeatNotificationId?: string }> {
  await ensureAndroidChannel();

  if (reminder.status !== 'pending' && reminder.status !== 'snoozed') {
    return { notificationIds: [] };
  }

  const dueDate = new Date(reminder.dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    return { notificationIds: [] };
  }

  if (Platform.OS === 'web') {
    const notificationIds = await scheduleWebReminder(reminder);
    return { notificationIds };
  }

  const { shouldPlaySound, shouldVibrate } = alertModeToSoundVibrate(reminder.alertMode);

  const notificationIds: string[] = [];

  if (dueDate.getTime() > Date.now()) {
    const mainId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: 'Reminder due',
        data: {
          reminderId: reminder.id,
          kind: 'due' as const,
          alertMode: reminder.alertMode,
        },
        sound: shouldPlaySound ? 'default' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dueDate,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    notificationIds.push(mainId);
  }

  return { notificationIds, criticalRepeatNotificationId: undefined };
}

/** Call when a critical reminder fires in foreground or from notification — repeats every 2 minutes until dismissed. */
export async function scheduleCriticalRepeat(reminder: Reminder): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    return undefined;
  }
  await ensureAndroidChannel();

  const { shouldPlaySound, shouldVibrate } = alertModeToSoundVibrate(reminder.alertMode);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: 'Critical reminder — open Buzz to dismiss',
      data: {
        reminderId: reminder.id,
        kind: 'criticalRepeat' as const,
        alertMode: reminder.alertMode,
      },
      sound: shouldPlaySound ? 'default' : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 120,
      repeats: true,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  void shouldVibrate;
  return id;
}

export async function cancelNotificationId(id: string | undefined): Promise<void> {
  if (!id) return;
  if (Platform.OS === 'web') {
    cancelWebTimer(id);
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    logger.warn('cancelNotificationId', e);
  }
}

export async function cancelAllForReminder(reminder: Reminder): Promise<void> {
  const ids = reminder.notificationIds ?? [];
  for (const nid of ids) {
    await cancelNotificationId(nid);
  }
  await cancelNotificationId(reminder.criticalRepeatNotificationId);
}
