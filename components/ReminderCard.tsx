import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { TOKENS } from '../constants/colors';
import type { Reminder } from '../constants/reminderTypes';
import { REMINDER_TYPE_META } from '../constants/reminderTypes';
import { BuzzText } from './ui/BuzzText';
import { PriorityPill } from './ui/PriorityPill';

export interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
  style?: ViewStyle;
  faded?: boolean;
}

export function ReminderCard({ reminder, onPress, style, faded }: ReminderCardProps) {
  const meta = REMINDER_TYPE_META[reminder.type];

  const due = new Date(reminder.dueAt);
  const timeLabel = due.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const metaLine = `${meta.label} · ${timeLabel}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        faded && styles.faded,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconBubble}>
        <Ionicons
          name={meta.icon as ComponentProps<typeof Ionicons>['name']}
          size={20}
          color={TOKENS.ink}
        />
      </View>
      <View style={styles.body}>
        <BuzzText variant="body" style={styles.title} numberOfLines={2}>
          {reminder.title}
        </BuzzText>
        <BuzzText variant="caption" muted numberOfLines={1}>
          {metaLine}
        </BuzzText>
      </View>
      <PriorityPill priority={reminder.priority} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    backgroundColor: TOKENS.card,
  },
  faded: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOKENS.card,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 19,
  },
});
