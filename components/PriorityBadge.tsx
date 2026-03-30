import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { PRIORITY_COLORS } from '../constants/colors';
import type { Priority } from '../constants/reminderTypes';
import { PRIORITY_LABELS } from '../constants/reminderTypes';

export interface PriorityBadgeProps {
  priority: Priority;
  style?: ViewStyle;
}

export function PriorityBadge({ priority, style }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];
  return (
    <View style={[styles.wrap, { borderColor: color }, style]}>
      <Ionicons name="flag" size={12} color={color} />
      <Text style={[styles.text, { color }]}>{PRIORITY_LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
