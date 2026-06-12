import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';
import { TOKENS } from '../../constants/colors';

export interface BuzzCardProps extends ViewProps {
  onPress?: PressableProps['onPress'];
  faded?: boolean;
}

export function BuzzCard({ onPress, faded, style, children, ...props }: BuzzCardProps) {
  const cardStyle = {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    opacity: faded ? 0.55 : 1,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: faded ? 0.5 : 0.92 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
}
