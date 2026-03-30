import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.wrap}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: THEME.background,
  },
  title: {
    color: THEME.textSecondary,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    padding: 12,
  },
  linkText: {
    color: THEME.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
