import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIORITY_COLORS, THEME, TOKENS } from '../constants/colors';
import type { Reminder } from '../constants/reminderTypes';
import { STRINGS } from '../constants/strings';

export interface AlertOverlayProps {
  reminder: Reminder;
  onDismiss: () => void;
  style?: ViewStyle;
}

export function AlertOverlay({ reminder, onDismiss, style }: AlertOverlayProps) {
  const insets = useSafeAreaInsets();
  const accent = PRIORITY_COLORS.critical;

  return (
    <View style={[styles.backdrop, { paddingTop: insets.top }, style]}>
      <View style={[styles.panel, { borderColor: accent }]}>
        <Ionicons name="warning" size={48} color={accent} />
        <Text style={styles.title}>Critical reminder</Text>
        <Text style={styles.body}>{reminder.title}</Text>
        <Text style={styles.hint}>
          Repeats every 2 minutes until you dismiss. Open the reminder to snooze or
          complete.
        </Text>
        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{STRINGS.actions.dismiss}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  panel: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: TOKENS.cream,
    fontSize: 16,
    fontWeight: '700',
  },
});
