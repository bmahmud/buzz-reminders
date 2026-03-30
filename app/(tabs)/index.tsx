import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReminderCard } from '../../components/ReminderCard';
import { THEME } from '../../constants/colors';
import { SwipeableRow } from '../../components/SwipeableRow';
import { STRINGS } from '../../constants/strings';
import { useTodayReminders } from '../../hooks/useReminders';
import { promptSnooze } from '../../lib/snoozePrompt';
import { useReminderStore } from '../../store/reminders';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useTodayReminders();
  const reminders = useReminderStore((s) => s.reminders);
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);
  const totalCount = reminders.length;
  const activeCount = reminders.filter(
    (item) => item.status === 'pending' || item.status === 'snoozed'
  ).length;
  const completedCount = reminders.filter((item) => item.status === 'completed').length;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{STRINGS.appName}</Text>
            <Text style={styles.subtitle}>Stay organized and never miss a thing</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{completedCount}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Add a new reminder..."
                placeholderTextColor={THEME.textSecondary}
                editable={false}
              />
              <Pressable
                onPress={() => router.push('/reminder/new')}
                style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionTitle}>ACTIVE ({items.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{STRINGS.empty.today}</Text>
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
  header: {
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#E0F2FE',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statValue: {
    color: THEME.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: THEME.textSecondary,
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  addRow: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.textPrimary,
    backgroundColor: THEME.surface,
  },
  addButton: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: '#075985',
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    marginBottom: 12,
  },
  empty: {
    paddingTop: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingBottom: 24,
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
