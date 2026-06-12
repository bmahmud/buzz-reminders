import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitCard } from '../../components/HabitCard';
import { SwipeableRow } from '../../components/SwipeableRow';
import { BuzzText } from '../../components/ui/BuzzText';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TOKENS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { useHabitReminders } from '../../hooks/useHabits';
import { promptSnooze } from '../../lib/snoozePrompt';
import { useReminderStore } from '../../store/reminders';

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useHabitReminders();
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScreenHeader title="Habits" subtitle="keep the streak 🔥" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <BuzzText muted>{STRINGS.empty.habits}</BuzzText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <SwipeableRow
              onComplete={() => void complete(item.id)}
              onSnooze={() =>
                promptSnooze((m) => {
                  void snooze(item.id, m);
                })
              }
            >
              <HabitCard
                habit={item}
                onPress={() => router.push(`/reminder/${item.id}`)}
              />
            </SwipeableRow>
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
