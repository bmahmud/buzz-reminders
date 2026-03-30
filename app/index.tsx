import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { THEME } from '../constants/colors';
import { useSettingsHydration } from '../hooks/useHydration';
import { useSettingsStore } from '../store/settings';

export default function Index() {
  const hydrated = useSettingsHydration();
  const done = useSettingsStore((s) => s.hasCompletedOnboarding);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!done) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
