import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuzzButton } from '../../components/ui/BuzzButton';
import { BuzzText } from '../../components/ui/BuzzText';
import { TOKENS } from '../../constants/colors';
import { profileSchema } from '../../lib/validation';
import { syncProfile } from '../../lib/sync';
import { useSettingsStore } from '../../store/settings';

const EMOJI_OPTIONS = ['🦊', '🐻', '🐼', '🐨', '🦁', '🐸', '🌻', '⭐', '🎯', '💚'];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const displayName = useSettingsStore((s) => s.displayName);
  const avatarEmoji = useSettingsStore((s) => s.avatarEmoji);
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const setAvatarEmoji = useSettingsStore((s) => s.setAvatarEmoji);

  const [name, setName] = useState(displayName);
  const [emoji, setEmoji] = useState(avatarEmoji);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    const result = profileSchema.safeParse({ displayName: name, avatarEmoji: emoji });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid profile');
      return;
    }
    setDisplayName(result.data.displayName);
    if (result.data.avatarEmoji) setAvatarEmoji(result.data.avatarEmoji);
    await syncProfile(result.data.displayName, result.data.avatarEmoji ?? emoji);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BuzzText variant="title">Edit profile</BuzzText>
        <BuzzText muted style={styles.subtitle}>
          This name appears on your Today greeting.
        </BuzzText>

        <BuzzText variant="section" style={styles.label}>
          Avatar
        </BuzzText>
        <View style={styles.emojiRow}>
          {EMOJI_OPTIONS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
            >
              <BuzzText style={styles.emojiText}>{e}</BuzzText>
            </Pressable>
          ))}
        </View>

        <BuzzText variant="section" style={styles.label}>
          Display name
        </BuzzText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={TOKENS.inkSoft}
          style={styles.input}
          maxLength={40}
          autoCapitalize="words"
        />
        {error ? <BuzzText style={styles.error}>{error}</BuzzText> : null}

        <BuzzButton label="Save profile" onPress={onSave} style={styles.saveBtn} />
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <BuzzText muted>Cancel</BuzzText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: TOKENS.line,
    backgroundColor: TOKENS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: {
    borderColor: TOKENS.ink,
    borderWidth: 2,
    backgroundColor: TOKENS.paper,
  },
  emojiText: {
    fontSize: 26,
  },
  input: {
    borderWidth: 1,
    borderColor: TOKENS.ink,
    borderRadius: TOKENS.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 20,
    color: TOKENS.ink,
    backgroundColor: TOKENS.card,
    marginBottom: 8,
  },
  error: {
    color: TOKENS.accentCoral,
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 20,
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
});
