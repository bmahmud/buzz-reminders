import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { TOKENS } from '../constants/colors';
import type { Reminder } from '../constants/reminderTypes';
import { REMINDER_TYPE_META } from '../constants/reminderTypes';
import { BuzzText } from './ui/BuzzText';

export interface HabitCardProps {
  habit: Reminder;
  onPress: () => void;
  style?: ViewStyle;
}

export function HabitCard({ habit, onPress, style }: HabitCardProps) {
  const meta = REMINDER_TYPE_META[habit.type];
  const history = habit.weeklyHistory ?? [false, false, false, false, false, false, false];
  const streak = habit.streakCount ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.iconBubble}>
        <Ionicons
          name={meta.icon as ComponentProps<typeof Ionicons>['name']}
          size={20}
          color={TOKENS.ink}
        />
      </View>
      <View style={styles.body}>
        <BuzzText variant="body" style={styles.title}>
          {habit.title}
        </BuzzText>
        <View style={styles.weekRow}>
          {history.map((done, i) => (
            <View
              key={i}
              style={[styles.dayBox, done ? styles.dayDone : styles.dayEmpty]}
            />
          ))}
        </View>
      </View>
      <View style={styles.streak}>
        <BuzzText style={styles.streakNum}>{streak}</BuzzText>
        <BuzzText variant="caption" muted>
          days
        </BuzzText>
      </View>
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
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
  dayDone: {
    backgroundColor: TOKENS.accentGreen,
  },
  dayEmpty: {
    backgroundColor: 'transparent',
  },
  streak: {
    alignItems: 'center',
    minWidth: 44,
  },
  streakNum: {
    fontSize: 22,
    color: TOKENS.accentGreen,
  },
});
