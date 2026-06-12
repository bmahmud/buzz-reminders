import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReminderCard } from '../../components/ReminderCard';
import { SwipeableRow } from '../../components/SwipeableRow';
import { BuzzText } from '../../components/ui/BuzzText';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TOKENS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { useUpcomingGroups } from '../../hooks/useUpcomingGroups';
import { promptSnooze } from '../../lib/snoozePrompt';
import { useReminderStore } from '../../store/reminders';

export default function UpcomingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const groups = useUpcomingGroups();
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);
  const isEmpty = groups.length === 0;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.key}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScreenHeader title="Upcoming" subtitle="Next two weeks" />
        }
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.empty}>
              <BuzzText muted>{STRINGS.empty.upcoming}</BuzzText>
            </View>
          ) : null
        }
        renderItem={({ item: group }) => (
          <View style={styles.section}>
            <SectionHeader title={group.title} tone={group.tone} icon="calendar-outline" />
            {group.items.map((reminder) => (
              <View key={reminder.id} style={styles.row}>
                <SwipeableRow
                  onComplete={() => void complete(reminder.id)}
                  onSnooze={() =>
                    promptSnooze((m) => {
                      void snooze(reminder.id, m);
                    })
                  }
                >
                  <ReminderCard
                    reminder={reminder}
                    onPress={() => router.push(`/reminder/${reminder.id}`)}
                  />
                </SwipeableRow>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TOKENS.paper,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 8,
  },
  row: {
    marginBottom: 10,
  },
  empty: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
  },
});
