import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { useSettingsStore } from '../../store/settings';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const resetOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding);

  function onResetOnboarding() {
    Alert.alert(
      'Show onboarding again?',
      'You will see the welcome screen on next app launch.',
      [
        { text: STRINGS.actions.cancel, style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetOnboarding(false),
        },
      ]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.card}>
        <Ionicons name="notifications-outline" size={22} color={THEME.accent} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{STRINGS.settings.notifications}</Text>
          <Text style={styles.cardHint}>
            Manage notification permissions in system settings for the best experience.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onResetOnboarding}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Text style={styles.rowText}>{STRINGS.settings.resetOnboarding}</Text>
        <Ionicons name="chevron-forward" size={18} color={THEME.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardHint: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pressed: {
    opacity: 0.9,
  },
  rowText: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
