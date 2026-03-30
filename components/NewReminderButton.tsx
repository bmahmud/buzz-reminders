import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { THEME } from '../constants/colors';

export function NewReminderButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/reminder/new')}
      accessibilityRole="button"
      accessibilityLabel="New reminder"
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Ionicons name="add-circle" size={28} color={THEME.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginRight: 8,
    padding: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});
