import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { TOKENS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { BuzzText } from '../../components/ui/BuzzText';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return function TabBarIcon({ color }: { color: string }) {
    return <Ionicons name={name} size={22} color={color} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: TOKENS.accentGreen,
        tabBarInactiveTintColor: TOKENS.inkSoft,
        tabBarLabel: ({ color, children }) => (
          <BuzzText variant="caption" style={{ color, fontSize: 12, marginTop: -2 }}>
            {children}
          </BuzzText>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: STRINGS.tabs.today,
          tabBarIcon: tabIcon('today-outline'),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: STRINGS.tabs.upcoming,
          tabBarIcon: tabIcon('calendar-outline'),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: STRINGS.tabs.habits,
          tabBarIcon: tabIcon('repeat-outline'),
        }}
      />
      <Tabs.Screen
        name="all"
        options={{
          title: STRINGS.tabs.all,
          tabBarIcon: tabIcon('list-outline'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: STRINGS.tabs.settings,
          tabBarIcon: tabIcon('sunny-outline'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TOKENS.card,
    borderTopColor: TOKENS.line,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
});
