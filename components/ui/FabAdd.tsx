import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { TOKENS } from '../../constants/colors';

export interface FabAddProps {
  onPress?: () => void;
}

export function FabAdd({ onPress }: FabAddProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.push('/reminder/new'))}
      accessibilityRole="button"
      accessibilityLabel="Add reminder"
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={26} color={TOKENS.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
  pressed: {
    opacity: 0.88,
  },
});
