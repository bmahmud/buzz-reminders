import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { startCriticalRepeatIfNeeded } from '../store/reminders';
import { useReminderStore } from '../store/reminders';
import { useUiStore } from '../store/ui';
import { logger } from '../lib/logger';

interface NotificationData {
  reminderId?: string;
  kind?: 'due' | 'criticalRepeat';
}

export function useNotificationListeners(): void {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const received = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as NotificationData;
      if (!data?.reminderId || data.kind !== 'due') return;

      const reminder = useReminderStore
        .getState()
        .reminders.find((r) => r.id === data.reminderId);
      if (!reminder) return;

      if (reminder.priority === 'critical') {
        useUiStore.getState().setCriticalOverlayReminderId(reminder.id);
        void startCriticalRepeatIfNeeded(reminder).catch((e) =>
          logger.error('startCriticalRepeatIfNeeded', e)
        );
      }
    });

    const response = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      if (data?.reminderId) {
        router.push(`/reminder/${data.reminderId}`);
      }
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [router]);
}
