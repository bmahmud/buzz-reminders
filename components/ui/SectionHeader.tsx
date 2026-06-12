import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { TOKENS } from '../../constants/colors';
import { BuzzText } from './BuzzText';

export interface SectionHeaderProps {
  title: string;
  tone?: 'coral' | 'muted' | 'ink';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function SectionHeader({ title, tone = 'muted', icon, style }: SectionHeaderProps) {
  const color =
    tone === 'coral' ? TOKENS.accentCoral : tone === 'ink' ? TOKENS.ink : TOKENS.inkSoft;

  return (
    <View style={[styles.row, style]}>
      {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
      <BuzzText variant="section" style={{ color }}>
        {title}
      </BuzzText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
});
