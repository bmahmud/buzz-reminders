import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ReminderForm } from '../../../components/ReminderForm';
import { BuzzText } from '../../../components/ui/BuzzText';
import { TOKENS } from '../../../constants/colors';
import { useReminderStore } from '../../../store/reminders';

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminder = useReminderStore((s) =>
    typeof id === 'string' ? s.reminders.find((r) => r.id === id) : undefined
  );

  if (!id) {
    return (
      <View style={styles.center}>
        <BuzzText muted>Invalid reminder.</BuzzText>
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={TOKENS.accentGreen} />
      </View>
    );
  }

  return <ReminderForm mode="edit" initial={reminder} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOKENS.paper,
  },
});
