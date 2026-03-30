import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { requestNotificationPermissions } from '../lib/notifications';
import { useSettingsStore } from '../store/settings';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setDone = useSettingsStore((s) => s.setHasCompletedOnboarding);

  async function onEnable() {
    await requestNotificationPermissions();
    setDone(true);
    router.replace('/(tabs)');
  }

  function onSkip() {
    setDone(true);
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Ionicons name="notifications" size={48} color={THEME.accent} />
        <Text style={styles.title}>{STRINGS.onboarding.title}</Text>
        <Text style={styles.subtitle}>{STRINGS.onboarding.subtitle}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onEnable}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>{STRINGS.onboarding.enable}</Text>
        </Pressable>
        <Pressable onPress={onSkip} style={styles.secondary}>
          <Text style={styles.secondaryText}>{STRINGS.onboarding.skip}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 12,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: THEME.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: THEME.textSecondary,
    fontSize: 15,
  },
});
