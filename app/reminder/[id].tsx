import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PriorityBadge } from '../../components/PriorityBadge';
import { THEME } from '../../constants/colors';
import { REMINDER_TYPE_META } from '../../constants/reminderTypes';
import { STRINGS } from '../../constants/strings';
import { useReminderStore } from '../../store/reminders';

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reminder = useReminderStore((s) =>
    typeof id === 'string' ? s.reminders.find((r) => r.id === id) : undefined
  );
  const deleteReminder = useReminderStore((s) => s.deleteReminder);
  const complete = useReminderStore((s) => s.completeReminder);

  if (!reminder) {
    return (
      <View style={[styles.center, { paddingBottom: insets.bottom }]}>
        <Text style={styles.muted}>Reminder not found.</Text>
      </View>
    );
  }

  const meta = REMINDER_TYPE_META[reminder.type];
  const due = new Date(reminder.dueAt);

  function onDelete() {
    Alert.alert(
      'Delete reminder?',
      'This cannot be undone.',
      [
        { text: STRINGS.actions.cancel, style: 'cancel' },
        {
          text: STRINGS.actions.delete,
          style: 'destructive',
          onPress: () => {
            void deleteReminder(reminder.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <View style={styles.iconRow}>
          <Ionicons
            name={meta.icon as ComponentProps<typeof Ionicons>['name']}
            size={28}
            color={THEME.accent}
          />
          <Text style={styles.type}>{meta.label}</Text>
        </View>
        <Text style={styles.title}>{reminder.title}</Text>
        <PriorityBadge priority={reminder.priority} />
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>{STRINGS.reminder.dateTimeLabel}</Text>
        <Text style={styles.value}>
          {due.toLocaleString(undefined, {
            weekday: 'long',
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Text>
      </View>

      {reminder.description ? (
        <View style={styles.block}>
          <Text style={styles.label}>{STRINGS.reminder.notesLabel}</Text>
          <Text style={styles.value}>{reminder.description}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => void complete(reminder.id).then(() => router.back())}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={styles.primaryText}>{STRINGS.actions.complete}</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          <Text style={styles.dangerText}>{STRINGS.actions.delete}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: THEME.textSecondary,
    fontSize: 15,
  },
  header: {
    gap: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  type: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  block: {
    gap: 6,
  },
  label: {
    color: THEME.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: THEME.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    borderRadius: 14,
  },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b55',
    paddingVertical: 14,
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '700',
  },
});
