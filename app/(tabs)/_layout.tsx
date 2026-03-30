import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { THEME } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { NewReminderButton } from '../../components/NewReminderButton';

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
        headerShown: true,
        headerStyle: { backgroundColor: THEME.background },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#BAE6FD',
        },
        tabBarActiveTintColor: THEME.accent,
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: STRINGS.tabs.today,
          tabBarIcon: tabIcon('today-outline'),
          headerRight: () => <NewReminderButton />,
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: STRINGS.tabs.upcoming,
          tabBarIcon: tabIcon('calendar-outline'),
          headerRight: () => <NewReminderButton />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: STRINGS.tabs.habits,
          tabBarIcon: tabIcon('repeat-outline'),
          headerRight: () => <NewReminderButton />,
        }}
      />
      <Tabs.Screen
        name="all"
        options={{
          title: STRINGS.tabs.all,
          tabBarIcon: tabIcon('list-outline'),
          headerRight: () => <NewReminderButton />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: STRINGS.tabs.settings,
          tabBarIcon: tabIcon('settings-outline'),
        }}
      />
    </Tabs>
  );
}
