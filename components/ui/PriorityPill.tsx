import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { PRIORITY_COLORS, PRIORITY_UI_LABELS } from '../../constants/colors';
import type { Priority } from '../../constants/reminderTypes';

export interface PriorityPillProps {
  priority: Priority;
  style?: ViewStyle;
}

export function PriorityPill({ priority, style }: PriorityPillProps) {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_UI_LABELS[priority];

  return (
    <View style={[styles.pill, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2c2a26',
    backgroundColor: '#fffdf8',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 14,
    color: '#2c2a26',
  },
});
