import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzButton } from '../components/ui/BuzzButton';
import { BuzzText } from '../components/ui/BuzzText';
import { TOKENS } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { isSupabaseConfigured } from '../lib/supabase';
import { requestNotificationPermissions } from '../lib/notifications';
import { useSettingsStore } from '../store/settings';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setDone = useSettingsStore((s) => s.setHasCompletedOnboarding);

  async function onEnable() {
    await requestNotificationPermissions();
    setDone(true);
    if (isSupabaseConfigured) {
      router.replace('/auth');
      return;
    }
    router.replace('/(tabs)');
  }

  function onSkip() {
    setDone(true);
    if (isSupabaseConfigured) {
      router.replace('/auth');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications-outline" size={40} color={TOKENS.cream} />
        </View>
        <BuzzText variant="title">{STRINGS.onboarding.title}</BuzzText>
        <BuzzText muted style={styles.subtitle}>
          {STRINGS.onboarding.subtitle}
        </BuzzText>
      </View>
      <View style={styles.actions}>
        <BuzzButton label={STRINGS.onboarding.enable} onPress={onEnable} />
        <Pressable onPress={onSkip} style={styles.secondary}>
          <BuzzText muted>{STRINGS.onboarding.skip}</BuzzText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.paper,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 16,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TOKENS.accentGreen,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  secondary: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
