import { Text, type TextProps } from 'react-native';
import { TOKENS } from '../../constants/colors';

type BuzzTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'section';

export interface BuzzTextProps extends TextProps {
  variant?: BuzzTextVariant;
  muted?: boolean;
}

const variantStyles: Record<BuzzTextVariant, { fontSize: number; lineHeight: number }> = {
  title: { fontSize: 28, lineHeight: 34 },
  subtitle: { fontSize: 18, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
  section: { fontSize: 15, lineHeight: 20 },
};

export function BuzzText({
  variant = 'body',
  muted = false,
  style,
  ...props
}: BuzzTextProps) {
  const v = variantStyles[variant];
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: 'PatrickHand_400Regular',
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          color: muted ? TOKENS.inkSoft : TOKENS.ink,
        },
        style,
      ]}
    />
  );
}
