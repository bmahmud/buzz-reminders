import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReminderCard } from '../../components/ReminderCard';
import { SwipeableRow } from '../../components/SwipeableRow';
import { THEME } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { useUpcomingReminders } from '../../hooks/useReminders';
import { promptSnooze } from '../../lib/snoozePrompt';
import { useReminderStore } from '../../store/reminders';

export default function UpcomingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useUpcomingReminders();
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{STRINGS.empty.upcoming}</Text>
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
              <ReminderCard
                reminder={item}
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
    backgroundColor: THEME.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    marginBottom: 12,
  },
  empty: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
