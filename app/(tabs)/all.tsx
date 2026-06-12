import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReminderCard } from '../../components/ReminderCard';
import { SwipeableRow } from '../../components/SwipeableRow';
import { BuzzText } from '../../components/ui/BuzzText';
import { PillChip } from '../../components/ui/PillChip';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TOKENS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import type { ReminderType } from '../../constants/reminderTypes';
import { promptSnooze } from '../../lib/snoozePrompt';
import { selectAllActiveSorted, useReminderStore } from '../../store/reminders';

type FilterKey = 'all' | 'task' | 'bill' | 'medication';

const FILTERS: { key: FilterKey; label: string; type?: ReminderType }[] = [
  { key: 'all', label: 'All' },
  { key: 'task', label: 'Tasks', type: 'task' },
  { key: 'bill', label: 'Bills', type: 'bill' },
  { key: 'medication', label: 'Meds', type: 'medication' },
];

export default function AllRemindersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);
  const allItems = useReminderStore(selectAllActiveSorted);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const typeFilter = FILTERS.find((f) => f.key === filter)?.type;
    return allItems.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q);
    });
  }, [allItems, query, filter]);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <ScreenHeader title="Everything" showFab />
            <View style={styles.searchBox}>
              <BuzzText muted style={styles.searchIcon}>
                🔍
              </BuzzText>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search reminders"
                placeholderTextColor={TOKENS.inkSoft}
                style={styles.searchInput}
              />
            </View>
            <View style={styles.filters}>
              {FILTERS.map((f) => (
                <PillChip
                  key={f.key}
                  label={f.label}
                  active={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <BuzzText muted>{STRINGS.empty.all}</BuzzText>
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
    backgroundColor: TOKENS.paper,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TOKENS.ink,
    borderRadius: TOKENS.cardRadius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: TOKENS.card,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PatrickHand_400Regular',
    fontSize: 16,
    color: TOKENS.ink,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
