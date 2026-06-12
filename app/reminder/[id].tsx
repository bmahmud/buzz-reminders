import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzButton } from '../../components/ui/BuzzButton';
import { BuzzText } from '../../components/ui/BuzzText';
import { PriorityPill } from '../../components/ui/PriorityPill';
import { TOKENS } from '../../constants/colors';
import { formatEarlyReminder } from '../../constants/earlyReminder';
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
        <BuzzText muted>Reminder not found.</BuzzText>
      </View>
    );
  }

  const meta = REMINDER_TYPE_META[reminder.type];
  const due = new Date(reminder.dueAt);
  const reminderId = reminder.id;

  function onDelete() {
    Alert.alert('Delete reminder?', 'This cannot be undone.', [
      { text: STRINGS.actions.cancel, style: 'cancel' },
      {
        text: STRINGS.actions.delete,
        style: 'destructive',
        onPress: () => {
          void deleteReminder(reminderId);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <View style={styles.iconRow}>
          <Ionicons
            name={meta.icon as ComponentProps<typeof Ionicons>['name']}
            size={28}
            color={TOKENS.ink}
          />
          <BuzzText muted>{meta.label}</BuzzText>
        </View>
        <BuzzText variant="title">{reminder.title}</BuzzText>
        <PriorityPill priority={reminder.priority} />
      </View>

      <View style={styles.block}>
        <BuzzText variant="section" muted>
          {STRINGS.reminder.dateTimeLabel}
        </BuzzText>
        <BuzzText variant="body">
          {due.toLocaleString(undefined, {
            weekday: 'long',
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </BuzzText>
      </View>

      <View style={styles.block}>
        <BuzzText variant="section" muted>
          Early reminder
        </BuzzText>
        <BuzzText variant="body">
          {formatEarlyReminder(reminder.earlyReminderMinutes)}
        </BuzzText>
      </View>

      {reminder.description ? (
        <View style={styles.block}>
          <BuzzText variant="section" muted>
            {STRINGS.reminder.notesLabel}
          </BuzzText>
          <BuzzText variant="body">{reminder.description}</BuzzText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <BuzzButton
          label={STRINGS.actions.complete}
          onPress={() => void complete(reminder.id).then(() => router.back())}
        />
        <BuzzButton
          label="Edit"
          variant="secondary"
          onPress={() => router.push(`/reminder/edit/${reminder.id}`)}
        />
        <BuzzButton
          label={STRINGS.actions.delete}
          variant="danger"
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    backgroundColor: TOKENS.paper,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOKENS.paper,
  },
  header: {
    gap: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  block: {
    gap: 6,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
