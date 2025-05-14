import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import MainScreen from '../screens/home/MainScreen';
import { PlansScreen } from '../screens/plans';
import { ChatsScreen } from '../screens/chat';
import { ConfigScreen } from '../screens';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Config') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.placeholder,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerRight: () => null
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} options={{ title: t('navigation.home') }} />
      <Tab.Screen name="Plans" component={PlansScreen} options={{ title: t('navigation.plans') }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: t('navigation.chats') }} />
      <Tab.Screen name="Config" component={ConfigScreen} options={{ title: t('navigation.config') }} />
    </Tab.Navigator>
  );
} 