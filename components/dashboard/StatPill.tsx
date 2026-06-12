import { StyleSheet, View, type ViewStyle } from 'react-native';
import { TOKENS } from '../../constants/colors';
import { BuzzText } from '../ui/BuzzText';

export interface StatPillProps {
  label: string;
  value: number;
  accent: string;
  style?: ViewStyle;
}

export function StatPill({ label, value, accent, style }: StatPillProps) {
  return (
    <View style={[styles.pill, { borderColor: accent }, style]}>
      <BuzzText style={[styles.value, { color: accent }]}>{value}</BuzzText>
      <BuzzText variant="caption" muted style={styles.label}>
        {label}
      </BuzzText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: TOKENS.card,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 0,
  },
  value: {
    fontSize: 26,
    lineHeight: 30,
    fontFamily: 'PatrickHand_400Regular',
  },
  label: {
    marginTop: 2,
    textAlign: 'center',
  },
});
