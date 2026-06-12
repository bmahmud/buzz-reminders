import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { TOKENS } from '../../constants/colors';

export interface PillChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function PillChip({ label, active, onPress, icon, style }: PillChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
  chipActive: {
    backgroundColor: TOKENS.ink,
  },
  chipInactive: {
    backgroundColor: TOKENS.card,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    marginRight: -2,
  },
  label: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 18,
  },
  labelActive: {
    color: TOKENS.card,
  },
  labelInactive: {
    color: TOKENS.ink,
  },
});
