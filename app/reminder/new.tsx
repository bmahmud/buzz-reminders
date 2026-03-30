import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/colors';
import type {
  AlertMode,
  Priority,
  RecurrenceRule,
  ReminderType,
} from '../../constants/reminderTypes';
import {
  ALERT_MODE_LABELS,
  PRIORITY_LABELS,
  REMINDER_TYPE_META,
} from '../../constants/reminderTypes';
import { STRINGS } from '../../constants/strings';
import { useReminderStore } from '../../store/reminders';

/** High-contrast form text (labels, title field, chips, date). */
const FORM_TEXT = '#000000';

const TYPES: ReminderType[] = [
  'task',
  'event',
  'habit',
  'medication',
  'bill',
  'custom',
];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const ALERTS: AlertMode[] = ['sound', 'vibrate', 'both', 'silent'];

const RECURRENCE_OPTIONS: { label: string; rule: RecurrenceRule }[] = [
  {
    label: 'One-time',
    rule: { frequency: 'once', endCondition: 'never' },
  },
  {
    label: 'Daily',
    rule: { frequency: 'daily', endCondition: 'never' },
  },
  {
    label: 'Weekdays',
    rule: { frequency: 'weekdays', endCondition: 'never' },
  },
  {
    label: 'Weekends',
    rule: { frequency: 'weekends', endCondition: 'never' },
  },
  {
    label: 'Weekly',
    rule: { frequency: 'weekly', endCondition: 'never' },
  },
  {
    label: 'Monthly',
    rule: { frequency: 'monthly', endCondition: 'never' },
  },
];

export default function NewReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addReminder = useReminderStore((s) => s.addReminder);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('task');
  const [priority, setPriority] = useState<Priority>('medium');
  const [due, setDue] = useState(() => new Date(Date.now() + 3600000));
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    RECURRENCE_OPTIONS[0].rule
  );
  const [alertMode, setAlertMode] = useState<AlertMode>('both');
  const [notes, setNotes] = useState('');

  async function onSave() {
    const trimmed = title.trim();
    if (!trimmed) return;

    await addReminder({
      title: trimmed.slice(0, 80),
      description: notes.trim() ? notes.trim().slice(0, 500) : undefined,
      type,
      priority,
      dueAt: due.toISOString(),
      recurrence:
        recurrence.frequency === 'once' ? undefined : recurrence,
      alertMode,
      snoozeOptions: [],
      tags: [],
      status: 'pending',
    });
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>{STRINGS.reminder.titleLabel}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What needs doing?"
        placeholderTextColor={THEME.textSecondary}
        style={styles.input}
        maxLength={80}
      />

      <Text style={styles.label}>{STRINGS.reminder.typeLabel}</Text>
      <View style={styles.chips}>
        {TYPES.map((t) => {
          const active = type === t;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {REMINDER_TYPE_META[t].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{STRINGS.reminder.priorityLabel}</Text>
      <View style={styles.chips}>
        {PRIORITIES.map((p) => {
          const active = priority === p;
          return (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {PRIORITY_LABELS[p]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{STRINGS.reminder.dateTimeLabel}</Text>
      {Platform.OS === 'android' && (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            {due.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
        </Pressable>
      )}
      {(Platform.OS === 'ios' || showPicker) && (
        <DateTimePicker
          value={due}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          {...(Platform.OS === 'ios'
            ? {
                textColor: FORM_TEXT,
                accentColor: THEME.accent,
                themeVariant: 'light' as const,
              }
            : {})}
          onChange={(_, d) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (d) setDue(d);
          }}
        />
      )}

      <Text style={styles.label}>{STRINGS.reminder.recurrenceLabel}</Text>
      <View style={styles.chips}>
        {RECURRENCE_OPTIONS.map((opt) => {
          const active = recurrence.frequency === opt.rule.frequency;
          return (
            <Pressable
              key={opt.label}
              onPress={() => setRecurrence(opt.rule)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{STRINGS.reminder.alertLabel}</Text>
      <View style={styles.chips}>
        {ALERTS.map((a) => {
          const active = alertMode === a;
          return (
            <Pressable
              key={a}
              onPress={() => setAlertMode(a)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {ALERT_MODE_LABELS[a]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{STRINGS.reminder.notesLabel}</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional details"
        placeholderTextColor={THEME.textSecondary}
        style={[styles.input, styles.notes]}
        multiline
        maxLength={500}
      />

      <Pressable
        onPress={onSave}
        style={({ pressed }) => [styles.save, pressed && styles.savePressed]}
      >
        <Text style={styles.saveText}>{STRINGS.actions.save}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  label: {
    marginTop: 4,
    color: FORM_TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: FORM_TEXT,
    fontSize: 16,
    backgroundColor: THEME.surface,
  },
  notes: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  chipActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.surfaceElevated,
  },
  chipText: {
    color: FORM_TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: FORM_TEXT,
    fontWeight: '700',
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  dateButtonText: {
    color: FORM_TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
  save: {
    marginTop: 16,
    backgroundColor: THEME.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  savePressed: {
    opacity: 0.9,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
