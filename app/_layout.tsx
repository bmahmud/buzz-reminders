import '../global.css';

import { PatrickHand_400Regular, useFonts } from '@expo-google-fonts/patrick-hand';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertOverlay } from '../components/AlertOverlay';
import { TOKENS } from '../constants/colors';
import { useNotificationListeners } from '../hooks/useNotifications';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { useAuthSync } from '../hooks/useAuthSync';
import { useReminderStore } from '../store/reminders';
import { useUiStore } from '../store/ui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PatrickHand_400Regular });
  useNotificationListeners();
  useServiceWorker();
  useAuthSync();

  const criticalId = useUiStore((s) => s.criticalOverlayReminderId);
  const setCriticalId = useUiStore((s) => s.setCriticalOverlayReminderId);
  const criticalReminder = useReminderStore((s) =>
    criticalId ? s.reminders.find((r) => r.id === criticalId) : undefined
  );
  const dismissReminder = useReminderStore((s) => s.dismissReminder);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: TOKENS.paper },
            headerTintColor: TOKENS.ink,
            headerTitleStyle: { fontFamily: 'PatrickHand_400Regular' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: TOKENS.paper },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="reminder/new"
            options={{
              presentation: 'modal',
              title: 'New reminder',
              headerTitleStyle: { color: TOKENS.ink, fontFamily: 'PatrickHand_400Regular' },
              headerTintColor: TOKENS.ink,
              contentStyle: { backgroundColor: TOKENS.paper },
            }}
          />
          <Stack.Screen
            name="reminder/edit/[id]"
            options={{
              presentation: 'modal',
              title: 'Edit reminder',
              headerTitleStyle: { color: TOKENS.ink, fontFamily: 'PatrickHand_400Regular' },
              headerTintColor: TOKENS.ink,
              contentStyle: { backgroundColor: TOKENS.paper },
            }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{
              title: 'Edit profile',
              headerTitleStyle: { fontFamily: 'PatrickHand_400Regular' },
            }}
          />
          <Stack.Screen
            name="reminder/[id]"
            options={{
              title: 'Reminder',
              headerTitleStyle: { fontFamily: 'PatrickHand_400Regular' },
            }}
          />
        </Stack>
        {Platform.OS === 'web' ? <View nativeID="sw-register" /> : null}
        {criticalReminder ? (
          <AlertOverlay
            reminder={criticalReminder}
            onDismiss={() => {
              void dismissReminder(criticalReminder.id);
              setCriticalId(null);
            }}
          />
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TOKENS.paper,
  },
});
