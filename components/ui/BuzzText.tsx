import { Text, type TextProps } from 'react-native';
import { TOKENS } from '../../constants/colors';

type BuzzTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'section';

export interface BuzzTextProps extends TextProps {
  variant?: BuzzTextVariant;
  muted?: boolean;
}

const variantStyles: Record<BuzzTextVariant, { fontSize: number; lineHeight: number }> = {
  title: { fontSize: 32, lineHeight: 38 },
  subtitle: { fontSize: 22, lineHeight: 28 },
  body: { fontSize: 18, lineHeight: 24 },
  caption: { fontSize: 15, lineHeight: 20 },
  section: { fontSize: 17, lineHeight: 22 },
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
