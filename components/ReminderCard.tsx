import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { PRIORITY_COLORS, THEME } from '../constants/colors';
import type { Reminder } from '../constants/reminderTypes';
import { REMINDER_TYPE_META } from '../constants/reminderTypes';
import { PriorityBadge } from './PriorityBadge';

export interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
  style?: ViewStyle;
}

export function ReminderCard({ reminder, onPress, style }: ReminderCardProps) {
  const accent = PRIORITY_COLORS[reminder.priority];
  const meta = REMINDER_TYPE_META[reminder.type];

  const due = new Date(reminder.dueAt);
  const timeLabel = due.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateLabel = due.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: THEME.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconBubble, { borderColor: accent }]}>
          <Ionicons
            name={meta.icon as ComponentProps<typeof Ionicons>['name']}
            size={20}
            color={accent}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {reminder.title}
          </Text>
          <Text style={styles.meta}>
            {meta.label} · {dateLabel} · {timeLabel}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={THEME.textSecondary} />
      </View>
      <View style={styles.footer}>
        <PriorityBadge priority={reminder.priority} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: THEME.surfaceElevated,
  },
  pressed: {
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    marginTop: 4,
    color: THEME.textSecondary,
    fontSize: 13,
  },
  footer: {
    marginTop: 10,
  },
});
