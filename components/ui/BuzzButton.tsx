import { Pressable, StyleSheet, Text, type TextProps, ViewStyle } from 'react-native';
import { TOKENS } from '../../constants/colors';

type BuzzButtonVariant = 'primary' | 'secondary' | 'edit' | 'danger';

export interface BuzzButtonProps {
  label: string;
  onPress?: () => void;
  variant?: BuzzButtonVariant;
  style?: ViewStyle;
  textStyle?: TextProps['style'];
  disabled?: boolean;
}

const variantStyles: Record<
  BuzzButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: {
    bg: TOKENS.card,
    text: TOKENS.ink,
    border: TOKENS.ink,
  },
  secondary: {
    bg: TOKENS.accentGreen,
    text: TOKENS.cream,
    border: TOKENS.ink,
  },
  edit: {
    bg: TOKENS.accentPurple,
    text: TOKENS.cream,
    border: TOKENS.accentPurpleDark,
  },
  danger: {
    bg: TOKENS.card,
    text: TOKENS.hi,
    border: TOKENS.hi,
  },
};

export function BuzzButton({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}: BuzzButtonProps) {
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.text }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 20,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
});
