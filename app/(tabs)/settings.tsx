import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzCard } from '../../components/ui/BuzzCard';
import { BuzzText } from '../../components/ui/BuzzText';
import { TOKENS } from '../../constants/colors';
import { ALERT_MODE_LABELS } from '../../constants/reminderTypes';
import { STRINGS } from '../../constants/strings';
import { requestNotificationPermissions } from '../../lib/notifications';
import { isSupabaseConfigured } from '../../lib/supabase';
import { syncProfile } from '../../lib/sync';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const displayName = useSettingsStore((s) => s.displayName);
  const avatarEmoji = useSettingsStore((s) => s.avatarEmoji);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const defaultAlert = useSettingsStore((s) => s.defaultAlert);
  const snoozeMinutes = useSettingsStore((s) => s.snoozeMinutes);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setHasCompletedOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding);
  const setSkippedCloudAuth = useSettingsStore((s) => s.setSkippedCloudAuth);
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  async function onToggleNotifications(value: boolean) {
    setNotificationsEnabled(value);
    if (value) await requestNotificationPermissions();
  }

  async function onSignOut() {
    await signOut();
    setSkippedCloudAuth(false);
    router.replace('/auth');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <BuzzCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <BuzzText style={styles.avatarText}>{avatarEmoji}</BuzzText>
        </View>
        <View style={styles.profileBody}>
          <BuzzText variant="subtitle">{displayName} Rivera</BuzzText>
          <BuzzText variant="caption" muted>
            Tap to edit profile
          </BuzzText>
        </View>
        <Pressable
          onPress={() => void syncProfile(displayName, avatarEmoji)}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
        </Pressable>
      </BuzzCard>

      <BuzzText variant="caption" muted style={styles.sectionTitle}>
        Reminders
      </BuzzText>
      <BuzzCard style={styles.rowCard}>
        <BuzzText>Notifications</BuzzText>
        <Switch
          value={notificationsEnabled}
          onValueChange={onToggleNotifications}
          trackColor={{ false: TOKENS.line, true: TOKENS.accentGreen }}
        />
      </BuzzCard>
      <BuzzCard style={styles.rowCard}>
        <BuzzText>Default alert</BuzzText>
        <BuzzText muted>{ALERT_MODE_LABELS[defaultAlert]}</BuzzText>
      </BuzzCard>
      <BuzzCard style={styles.rowCard}>
        <BuzzText>Snooze</BuzzText>
        <BuzzText muted>{snoozeMinutes} min</BuzzText>
      </BuzzCard>

      <BuzzText variant="caption" muted style={styles.sectionTitle}>
        App
      </BuzzText>
      <BuzzCard style={styles.rowCard}>
        <BuzzText>Theme</BuzzText>
        <BuzzText muted>Warm</BuzzText>
      </BuzzCard>
      <Pressable
        onPress={() => {
          setHasCompletedOnboarding(false);
          router.replace('/onboarding');
        }}
      >
        <BuzzCard style={styles.rowCard}>
          <BuzzText>Show onboarding</BuzzText>
          <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
        </BuzzCard>
      </Pressable>

      {isSupabaseConfigured && user ? (
        <Pressable onPress={onSignOut} style={styles.signOutBtn}>
          <BuzzText style={{ color: TOKENS.accentCoral }}>Sign out</BuzzText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.paper,
    paddingHorizontal: 20,
    gap: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TOKENS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
  avatarText: {
    fontSize: 24,
  },
  profileBody: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  signOutBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
});
