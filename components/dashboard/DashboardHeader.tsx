import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOKENS } from '../../constants/colors';
import { BuzzText } from '../ui/BuzzText';
import { FabAdd } from '../ui/FabAdd';
import { StatPill } from './StatPill';

export interface DashboardHeaderProps {
  name: string;
  emoji: string;
  greeting: string;
  subtitle: string;
  nowCount: number;
  laterCount: number;
  doneCount: number;
}

export function DashboardHeader({
  name,
  emoji,
  greeting,
  subtitle,
  nowCount,
  laterCount,
  doneCount,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <BuzzText style={styles.avatarEmoji}>{emoji}</BuzzText>
          </View>
          <View style={styles.heroActions}>
            <FabAdd />
            <Pressable hitSlop={8} style={styles.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={24} color={TOKENS.ink} />
            </Pressable>
          </View>
        </View>

        <BuzzText variant="title" style={styles.greeting}>
          {greeting}, {name}!
        </BuzzText>
        <BuzzText variant="body" muted>
          {subtitle}
        </BuzzText>
      </View>

      <View style={styles.statsRow}>
        <StatPill label="Right now" value={nowCount} accent={TOKENS.accentCoral} />
        <StatPill label="Later" value={laterCount} accent={TOKENS.accentGreen} />
        <StatPill label="Done" value={doneCount} accent={TOKENS.accentPurple} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    padding: 20,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TOKENS.accentGreen,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuBtn: {
    padding: 4,
  },
  greeting: {
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
