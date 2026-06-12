import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TOKENS } from '../constants/colors';
import { isSupabaseConfigured } from '../lib/supabase';
import { useSettingsHydration } from '../hooks/useHydration';
import { selectAuthHydrated, selectIsAuthenticated, useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export default function Index() {
  const settingsHydrated = useSettingsHydration();
  const authHydrated = useAuthStore(selectAuthHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const done = useSettingsStore((s) => s.hasCompletedOnboarding);

  if (!settingsHydrated || !authHydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={TOKENS.accentGreen} />
      </View>
    );
  }

  if (!done) {
    return <Redirect href="/onboarding" />;
  }

  if (isSupabaseConfigured && !isAuthenticated) {
    const skipped = useSettingsStore.getState().skippedCloudAuth;
    if (!skipped) {
      return <Redirect href="/auth" />;
    }
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: TOKENS.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
