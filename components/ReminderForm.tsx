import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState, type CSSProperties } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzButton } from './ui/BuzzButton';
import { BuzzText } from './ui/BuzzText';
import { OptionPicker } from './ui/OptionPicker';
import { PillChip } from './ui/PillChip';
import { PRIORITY_FORM_LABELS, TOKENS } from '../constants/colors';
import { EARLY_REMINDER_OPTIONS, formatEarlyReminder } from '../constants/earlyReminder';
import type {
  AlertMode,
  Priority,
  RecurrenceRule,
  Reminder,
  ReminderType,
} from '../constants/reminderTypes';
import { REMINDER_TYPE_META } from '../constants/reminderTypes';
import { useReminderStore } from '../store/reminders';
import { useSettingsStore } from '../store/settings';

function toDatetimeLocalString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

const TYPES: ReminderType[] = ['task', 'event', 'habit', 'medication', 'bill', 'custom'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

const RECURRENCE_OPTIONS: { label: string; rule: RecurrenceRule }[] = [
  { label: 'One-time', rule: { frequency: 'once', endCondition: 'never' } },
  { label: 'Daily', rule: { frequency: 'daily', endCondition: 'never' } },
  { label: 'Weekly', rule: { frequency: 'weekly', endCondition: 'never' } },
];

export interface ReminderFormProps {
  mode: 'create' | 'edit';
  initial?: Reminder;
}

export function ReminderForm({ mode, initial }: ReminderFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addReminder = useReminderStore((s) => s.addReminder);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const defaultAlert = useSettingsStore((s) => s.defaultAlert);
  const defaultEarly = useSettingsStore((s) => s.defaultEarlyReminderMinutes);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<ReminderType>(initial?.type ?? 'task');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [due, setDue] = useState(() =>
    initial?.dueAt ? new Date(initial.dueAt) : new Date(Date.now() + 3600000)
  );
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    initial?.recurrence ?? RECURRENCE_OPTIONS[0].rule
  );
  const [earlyReminderMinutes, setEarlyReminderMinutes] = useState<number | null>(
    initial?.earlyReminderMinutes ?? defaultEarly ?? null
  );
  const [showEarlyPicker, setShowEarlyPicker] = useState(false);
  const [notes, setNotes] = useState(initial?.description ?? '');

  const whenLabel = due.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  async function onSave() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const payload = {
      title: trimmed.slice(0, 80),
      description: notes.trim() ? notes.trim().slice(0, 500) : undefined,
      type,
      priority,
      dueAt: due.toISOString(),
      recurrence: recurrence.frequency === 'once' ? undefined : recurrence,
      alertMode: (initial?.alertMode ?? defaultAlert) as AlertMode,
      earlyReminderMinutes,
      snoozeOptions: initial?.snoozeOptions ?? [],
      tags: initial?.tags ?? [],
      status: initial?.status ?? ('pending' as const),
    };

    if (mode === 'edit' && initial) {
      await updateReminder(initial.id, payload);
    } else {
      await addReminder(payload);
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.promptCard}>
          <BuzzText style={styles.promptLabel}>
            {mode === 'edit' ? 'Edit reminder' : "What's on your mind?"}
          </BuzzText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Type a reminder..."
            placeholderTextColor="rgba(255,253,248,0.7)"
            style={styles.promptInput}
            maxLength={80}
            multiline
          />
          <View style={styles.promptBar} />
          <BuzzText style={styles.promptEmoji}>🦊</BuzzText>
        </View>

        <BuzzText variant="section" style={styles.sectionLabel}>
          What kind?
        </BuzzText>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
            <PillChip
              key={t}
              label={REMINDER_TYPE_META[t].label}
              active={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>

        <BuzzText variant="section" style={styles.sectionLabel}>
          How urgent?
        </BuzzText>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <PillChip
              key={p}
              label={PRIORITY_FORM_LABELS[p]}
              active={priority === p}
              onPress={() => setPriority(p)}
            />
          ))}
        </View>

        <BuzzText variant="section" style={styles.sectionLabel}>
          When?
        </BuzzText>
        <View style={styles.whenBox}>
          <BuzzText>{whenLabel}</BuzzText>
        </View>
        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'datetime-local',
            value: toDatetimeLocalString(due),
            step: 60,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value;
              if (!v) return;
              const next = new Date(v);
              if (!Number.isNaN(next.getTime())) setDue(next);
            },
            style: {
              marginTop: 8,
              width: '100%',
              fontSize: 18,
              padding: 12,
              borderRadius: 24,
              border: `1px solid ${TOKENS.ink}`,
              color: TOKENS.ink,
              backgroundColor: TOKENS.card,
              fontFamily: 'Patrick Hand, cursive',
              boxSizing: 'border-box',
            } satisfies CSSProperties,
          })
        ) : null}
        {Platform.OS === 'android' && (
          <Pressable onPress={() => setShowPicker(true)} style={styles.whenBox}>
            <BuzzText>Change date & time</BuzzText>
          </Pressable>
        )}
        {(Platform.OS === 'ios' || (Platform.OS === 'android' && showPicker)) && (
          <DateTimePicker
            value={due}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            {...(Platform.OS === 'ios'
              ? { accentColor: TOKENS.accentGreen, themeVariant: 'light' as const }
              : {})}
            onChange={(_, d) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (d) setDue(d);
            }}
          />
        )}

        <BuzzText variant="section" style={styles.sectionLabel}>
          Repeat
        </BuzzText>
        <View style={styles.chipRow}>
          {RECURRENCE_OPTIONS.map((opt) => (
            <PillChip
              key={opt.label}
              label={opt.label}
              active={recurrence.frequency === opt.rule.frequency}
              onPress={() => setRecurrence(opt.rule)}
            />
          ))}
        </View>

        <BuzzText variant="section" style={styles.sectionLabel}>
          Early reminder
        </BuzzText>
        <Pressable style={styles.whenBox} onPress={() => setShowEarlyPicker(true)}>
          <BuzzText>{formatEarlyReminder(earlyReminderMinutes)}</BuzzText>
        </Pressable>

        <BuzzText variant="section" style={styles.sectionLabel}>
          Notes
        </BuzzText>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional details"
          placeholderTextColor={TOKENS.inkSoft}
          style={styles.notesInput}
          multiline
          maxLength={500}
        />

        <BuzzButton
          label={mode === 'edit' ? 'Save changes ✦' : 'Add it ✦'}
          onPress={onSave}
          style={styles.saveBtn}
        />
      </ScrollView>

      <OptionPicker
        visible={showEarlyPicker}
        title="Early reminder"
        options={EARLY_REMINDER_OPTIONS.map((o) => ({
          label: o.label,
          value: o.minutes,
        }))}
        selected={earlyReminderMinutes}
        onSelect={setEarlyReminderMinutes}
        onClose={() => setShowEarlyPicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: TOKENS.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  promptCard: {
    backgroundColor: TOKENS.accentGreen,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    padding: 20,
    minHeight: 120,
    marginBottom: 20,
  },
  promptLabel: {
    color: TOKENS.card,
    fontSize: 22,
  },
  promptInput: {
    color: TOKENS.card,
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 24,
    marginTop: 8,
    minHeight: 48,
  },
  promptBar: {
    height: 2,
    backgroundColor: TOKENS.card,
    opacity: 0.5,
    marginTop: 8,
    width: '60%',
  },
  promptEmoji: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    fontSize: 22,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  whenBox: {
    borderWidth: 1,
    borderColor: TOKENS.ink,
    borderRadius: TOKENS.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: TOKENS.card,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: TOKENS.ink,
    borderRadius: TOKENS.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: TOKENS.card,
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 18,
    color: TOKENS.ink,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 24,
  },
});
