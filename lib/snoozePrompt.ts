import { Alert } from 'react-native';
import { SNOOZE_MINUTES_OPTIONS } from '../constants/reminderTypes';

export function promptSnooze(onPick: (minutes: number) => void): void {
  Alert.alert(
    'Snooze',
    'Choose duration',
    [
      ...SNOOZE_MINUTES_OPTIONS.map((m) => ({
        text: `${m} min`,
        onPress: () => onPick(m),
      })),
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true }
  );
}
