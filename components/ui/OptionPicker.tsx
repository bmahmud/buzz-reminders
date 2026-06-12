import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { TOKENS } from '../../constants/colors';
import { BuzzText } from './BuzzText';

export interface OptionPickerProps<T extends string | number | null> {
  visible: boolean;
  title: string;
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export function OptionPicker<T extends string | number | null>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionPickerProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <BuzzText variant="subtitle" style={styles.title}>
            {title}
          </BuzzText>
          <ScrollView style={styles.list} bounces={false}>
            {options.map((opt) => {
              const isSelected = opt.value === selected;
              return (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                    isSelected && styles.rowSelected,
                  ]}
                >
                  <BuzzText style={isSelected ? styles.rowTextSelected : undefined}>
                    {isSelected ? '✓ ' : '   '}
                    {opt.label}
                  </BuzzText>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 42, 38, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.cardRadius,
    borderWidth: 1,
    borderColor: TOKENS.ink,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 12,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: TOKENS.line,
  },
  rowPressed: {
    backgroundColor: TOKENS.paper,
  },
  rowSelected: {
    backgroundColor: TOKENS.paper,
  },
  rowTextSelected: {
    fontWeight: '600',
  },
});
