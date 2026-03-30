import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { THEME } from '../constants/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: THEME.background },
            headerTintColor: THEME.textPrimary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: THEME.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="reminder/new"
            options={{
              presentation: 'modal',
              title: 'New reminder',
              headerTitleStyle: { color: '#000000', fontWeight: '600' },
              headerTintColor: '#000000',
              contentStyle: { backgroundColor: '#FFFFFF' },
            }}
          />
          <Stack.Screen name="reminder/[id]" options={{ title: 'Reminder' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.background,
  },
});
