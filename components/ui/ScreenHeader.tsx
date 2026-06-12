import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOKENS } from '../../constants/colors';
import { BuzzText } from './BuzzText';
import { FabAdd } from './FabAdd';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showFab?: boolean;
  left?: React.ReactNode;
  onMenuPress?: () => void;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  subtitle,
  showFab = true,
  left,
  onMenuPress,
  style,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {left ?? <View style={styles.spacer} />}
        <View style={styles.actions}>
          {showFab ? <FabAdd /> : null}
          {onMenuPress ? (
            <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={TOKENS.ink} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <BuzzText variant="title" style={styles.title}>
        {title}
      </BuzzText>
      {subtitle ? (
        <BuzzText variant="caption" muted style={styles.subtitle}>
          {subtitle}
        </BuzzText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: TOKENS.paper,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spacer: {
    width: 44,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
  menuBtn: {
    padding: 4,
  },
  title: {
    marginTop: 4,
  },
  subtitle: {
    marginTop: 4,
  },
});
