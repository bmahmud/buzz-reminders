import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { TOKENS } from '../constants/colors';

const THRESHOLD = 72;

export interface SwipeableRowProps {
  children: ReactNode;
  onComplete: () => void;
  onSnooze: () => void;
  style?: ViewStyle;
}

export function SwipeableRow({
  children,
  onComplete,
  onSnooze,
  style,
}: SwipeableRowProps) {
  const tx = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        runOnJS(onComplete)();
      } else if (e.translationX < -THRESHOLD) {
        runOnJS(onSnooze)();
      }
      tx.value = withSpring(0);
    });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftUnderlay}>
        <Ionicons name="checkmark-circle" size={26} color={TOKENS.accentGreen} />
        <Text style={styles.underlayTextDone}>Done</Text>
      </View>
      <View style={styles.rightUnderlay}>
        <Text style={styles.underlayTextSnooze}>Snooze</Text>
        <Ionicons name="alarm-outline" size={24} color={TOKENS.snooze} />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.front, frontStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: TOKENS.cardRadius,
  },
  front: {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.cardRadius,
  },
  leftUnderlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 8,
    backgroundColor: TOKENS.paper,
  },
  rightUnderlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
    gap: 8,
    backgroundColor: TOKENS.paper,
  },
  underlayTextDone: {
    color: TOKENS.accentGreen,
    fontSize: 17,
    fontFamily: 'PatrickHand_400Regular',
    fontWeight: '600',
  },
  underlayTextSnooze: {
    color: TOKENS.ink,
    fontSize: 17,
    fontFamily: 'PatrickHand_400Regular',
    fontWeight: '600',
  },
});
