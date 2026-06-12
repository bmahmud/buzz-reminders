import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ReminderCard } from '../../components/ReminderCard';
import { SwipeableRow } from '../../components/SwipeableRow';
import { BuzzText } from '../../components/ui/BuzzText';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TOKENS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { getTimeGreeting, useTodayBuckets } from '../../hooks/useTodayBuckets';
import { promptSnooze } from '../../lib/snoozePrompt';
import { useReminderStore } from '../../store/reminders';
import { useSettingsStore } from '../../store/settings';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rightNow, laterToday, doneToday, nowCount, laterCount } = useTodayBuckets();
  const displayName = useSettingsStore((s) => s.displayName);
  const avatarEmoji = useSettingsStore((s) => s.avatarEmoji);
  const complete = useReminderStore((s) => s.completeReminder);
  const snooze = useReminderStore((s) => s.snoozeReminder);

  const subtitle =
    nowCount + laterCount === 0
      ? 'Nothing scheduled today — tap + to add one'
      : `${nowCount + laterCount} on your plate today`;

  const sections = [
    {
      key: 'rightNow',
      title: 'Right now',
      tone: 'coral' as const,
      icon: 'alarm-outline' as const,
      data: rightNow,
      faded: false,
    },
    {
      key: 'later',
      title: 'Later today',
      tone: 'muted' as const,
      data: laterToday,
      faded: false,
    },
    {
      key: 'done',
      title: 'Done ✓',
      tone: 'muted' as const,
      data: doneToday,
      faded: true,
    },
  ].filter((s) => s.data.length > 0 || s.key === 'rightNow');

  const isEmpty = rightNow.length === 0 && laterToday.length === 0 && doneToday.length === 0;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 8 }]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <DashboardHeader
            name={displayName}
            emoji={avatarEmoji}
            greeting={getTimeGreeting()}
            subtitle={subtitle}
            nowCount={nowCount}
            laterCount={laterCount}
            doneCount={doneToday.length}
          />
        }
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.empty}>
              <BuzzText muted style={styles.emptyText}>
                {STRINGS.empty.today}
              </BuzzText>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <SectionHeader
              title={item.title}
              tone={item.tone}
              icon={'icon' in item ? item.icon : undefined}
            />
            {item.data.length === 0 ? (
              <BuzzText muted variant="caption">
                Nothing here right now
              </BuzzText>
            ) : (
              item.data.map((reminder) => (
                <View key={reminder.id} style={styles.row}>
                  {item.faded || item.key === 'done' ? (
                    <ReminderCard
                      reminder={reminder}
                      faded
                      onPress={() => router.push(`/reminder/${reminder.id}`)}
                    />
                  ) : (
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
                  )}
                </View>
              ))
            )}
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
    paddingBottom: 28,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
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
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
  },
});
