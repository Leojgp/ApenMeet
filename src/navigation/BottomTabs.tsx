import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/theme/useTheme';
import MainScreen from '../screens/home/MainScreen';
import { PlansScreen } from '../screens/plans';
import { ChatsScreen } from '../screens/chat';
import { ConfigScreen } from '../screens';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const theme = useTheme();
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
      <Tab.Screen name="Home" component={MainScreen} options={{ title: 'Eventos' }} />
      <Tab.Screen name="Plans" component={PlansScreen} options={{ title: 'Planes' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Config" component={ConfigScreen} options={{ title: 'Config' }} />
    </Tab.Navigator>
  );
} 