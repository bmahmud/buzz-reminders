import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzCard } from '../../components/ui/BuzzCard';
import { BuzzText } from '../../components/ui/BuzzText';
import { OptionPicker } from '../../components/ui/OptionPicker';
import { TOKENS } from '../../constants/colors';
import { EARLY_REMINDER_OPTIONS, formatEarlyReminder } from '../../constants/earlyReminder';
import { ALERT_MODE_LABELS, type AlertMode } from '../../constants/reminderTypes';
import { STRINGS } from '../../constants/strings';
import { requestNotificationPermissions } from '../../lib/notifications';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';

const ALERT_OPTIONS: AlertMode[] = ['sound', 'vibrate', 'both', 'silent'];
const SNOOZE_OPTIONS = [5, 10, 15, 30, 60];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const displayName = useSettingsStore((s) => s.displayName);
  const avatarEmoji = useSettingsStore((s) => s.avatarEmoji);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const defaultAlert = useSettingsStore((s) => s.defaultAlert);
  const snoozeMinutes = useSettingsStore((s) => s.snoozeMinutes);
  const defaultEarlyReminderMinutes = useSettingsStore((s) => s.defaultEarlyReminderMinutes);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setDefaultAlert = useSettingsStore((s) => s.setDefaultAlert);
  const setSnoozeMinutes = useSettingsStore((s) => s.setSnoozeMinutes);
  const setDefaultEarlyReminderMinutes = useSettingsStore((s) => s.setDefaultEarlyReminderMinutes);
  const setHasCompletedOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding);
  const setSkippedCloudAuth = useSettingsStore((s) => s.setSkippedCloudAuth);
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const [picker, setPicker] = useState<'alert' | 'snooze' | 'early' | null>(null);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <Pressable onPress={() => router.push('/profile/edit')}>
        <BuzzCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <BuzzText style={styles.avatarText}>{avatarEmoji}</BuzzText>
          </View>
          <View style={styles.profileBody}>
            <BuzzText variant="subtitle">{displayName}</BuzzText>
            <BuzzText variant="caption" style={{ color: TOKENS.accentPurple }}>
              Tap to edit profile
            </BuzzText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={TOKENS.inkSoft} />
        </BuzzCard>
      </Pressable>

      <BuzzText variant="caption" muted style={styles.sectionTitle}>
        Reminders
      </BuzzText>
      <BuzzCard style={styles.rowCard}>
        <BuzzText variant="body">Notifications</BuzzText>
        <Switch
          value={notificationsEnabled}
          onValueChange={onToggleNotifications}
          trackColor={{ false: TOKENS.line, true: TOKENS.accentGreen }}
          thumbColor={TOKENS.cream}
          ios_backgroundColor={TOKENS.line}
        />
      </BuzzCard>
      <Pressable onPress={() => setPicker('alert')}>
        <BuzzCard style={styles.rowCard}>
          <BuzzText variant="body">Default alert</BuzzText>
          <View style={styles.rowRight}>
            <BuzzText muted>{ALERT_MODE_LABELS[defaultAlert]}</BuzzText>
            <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
          </View>
        </BuzzCard>
      </Pressable>
      <Pressable onPress={() => setPicker('snooze')}>
        <BuzzCard style={styles.rowCard}>
          <BuzzText variant="body">Snooze</BuzzText>
          <View style={styles.rowRight}>
            <BuzzText muted>{snoozeMinutes} min</BuzzText>
            <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
          </View>
        </BuzzCard>
      </Pressable>
      <Pressable onPress={() => setPicker('early')}>
        <BuzzCard style={styles.rowCard}>
          <BuzzText variant="body">Early reminder</BuzzText>
          <View style={styles.rowRight}>
            <BuzzText muted>{formatEarlyReminder(defaultEarlyReminderMinutes)}</BuzzText>
            <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
          </View>
        </BuzzCard>
      </Pressable>

      <BuzzText variant="caption" muted style={styles.sectionTitle}>
        App
      </BuzzText>
      <BuzzCard style={styles.rowCard}>
        <BuzzText variant="body">Theme</BuzzText>
        <BuzzText muted>Warm</BuzzText>
      </BuzzCard>
      <Pressable
        onPress={() => {
          setHasCompletedOnboarding(false);
          router.replace('/onboarding');
        }}
      >
        <BuzzCard style={styles.rowCard}>
          <BuzzText variant="body">Show onboarding</BuzzText>
          <Ionicons name="chevron-forward" size={20} color={TOKENS.inkSoft} />
        </BuzzCard>
      </Pressable>

      {isSupabaseConfigured && user ? (
        <Pressable onPress={onSignOut} style={styles.signOutBtn}>
          <BuzzText style={{ color: TOKENS.accentCoral }}>Sign out</BuzzText>
        </Pressable>
      ) : null}

      <OptionPicker
        visible={picker === 'alert'}
        title="Default alert"
        options={ALERT_OPTIONS.map((a) => ({ label: ALERT_MODE_LABELS[a], value: a }))}
        selected={defaultAlert}
        onSelect={setDefaultAlert}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        visible={picker === 'snooze'}
        title="Snooze duration"
        options={SNOOZE_OPTIONS.map((m) => ({ label: `${m} min`, value: m }))}
        selected={snoozeMinutes}
        onSelect={setSnoozeMinutes}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        visible={picker === 'early'}
        title="Early reminder"
        options={EARLY_REMINDER_OPTIONS.map((o) => ({ label: o.label, value: o.minutes }))}
        selected={defaultEarlyReminderMinutes}
        onSelect={setDefaultEarlyReminderMinutes}
        onClose={() => setPicker(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.paper,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TOKENS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
  avatarText: {
    fontSize: 28,
  },
  profileBody: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signOutBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
});
