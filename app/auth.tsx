import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzText } from '../components/ui/BuzzText';
import { TOKENS } from '../constants/colors';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { emailSchema } from '../lib/validation';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setLoadingAuth = useAuthStore((s) => s.setLoading);

  async function onSendLink() {
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError('Enter a valid email address');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      router.replace('/(tabs)');
      return;
    }

    setLoading(true);
    setLoadingAuth(true);
    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : 'buzz-reminders://auth/callback';

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    setLoadingAuth(false);

    if (authError) {
      setError('Could not send magic link. Try again.');
      return;
    }
    setSent(true);
  }

  function onSkip() {
    useSettingsStore.getState().setSkippedCloudAuth(true);
    router.replace('/(tabs)');
  }

  if (!isSupabaseConfigured) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
        <BuzzText variant="title">Welcome to Buzz</BuzzText>
        <BuzzText muted style={styles.subtitle}>
          Cloud sync is not configured. Continue with local storage.
        </BuzzText>
        <Pressable onPress={onSkip} style={styles.primaryBtn}>
          <BuzzText style={styles.primaryBtnText}>Continue</BuzzText>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <BuzzText variant="title">Sign in to Buzz</BuzzText>
        <BuzzText muted style={styles.subtitle}>
          {sent
            ? 'Check your email for a magic link to sync reminders across devices.'
            : 'Enter your email and we will send a magic link — no password needed.'}
        </BuzzText>
      </View>

      {!sent ? (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={TOKENS.inkSoft}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />
          {error ? (
            <BuzzText style={styles.error}>{error}</BuzzText>
          ) : null}
          <Pressable
            onPress={onSendLink}
            disabled={loading}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          >
            {loading ? (
              <ActivityIndicator color={TOKENS.card} />
            ) : (
              <BuzzText style={styles.primaryBtnText}>Send magic link</BuzzText>
            )}
          </Pressable>
        </View>
      ) : null}

      <Pressable onPress={onSkip} style={styles.skipBtn}>
        <BuzzText muted>{sent ? 'Continue offline' : 'Skip for now'}</BuzzText>
      </Pressable>
    </KeyboardAvoidingView>
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
    gap: 8,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: TOKENS.ink,
    borderRadius: TOKENS.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 18,
    color: TOKENS.ink,
    backgroundColor: TOKENS.card,
  },
  error: {
    color: TOKENS.accentCoral,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: TOKENS.ink,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: TOKENS.card,
    fontSize: 18,
  },
  pressed: {
    opacity: 0.9,
  },
  skipBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
