import React from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { HomeScreen } from './screens/home';
import { SignUpScreen, SignInScreen } from './screens/auth';
import { PlansScreen, CreatePlanScreen, PlanDetailScreen, EditPlanScreen } from './screens/plans';
import { ConfigScreen, EditProfileScreen } from './screens';
import { ChatScreen, ChatsScreen } from './screens/chat';
import EventDetailsScreen from './screens/home/EventDetailsScreen';
import { Provider } from 'react-redux';
import { store } from './store';
import { useTheme } from './hooks/theme/useTheme';
import ThemeToggle from './components/theme/ThemeToggle';
import BottomTabs from './navigation/BottomTabs';

type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Tabs: undefined;
  Config: undefined;
  Plans: undefined;
  PlanDetail: { planId: string };
  CreatePlan: undefined;
  EditPlan: { planId: string };
  EditProfileScreen: undefined;
  Chat: { planId: string; planTitle: string };
  Chats: undefined;
  EventDetails: { event: any };
};

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const theme = useTheme();
  const isAuthenticated = useSelector((state: RootState) => !!state.user._id);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.text,
          cardStyle: { backgroundColor: theme.background }
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
        )}
        <Stack.Screen name="Config" component={ConfigScreen} options={{ headerRight: () => <ThemeToggle /> }} />
        <Stack.Screen name="Plans" component={PlansScreen}/>
        <Stack.Screen name="PlanDetail" component={PlanDetailScreen}/>
        <Stack.Screen name="CreatePlan" component={CreatePlanScreen}/>
        <Stack.Screen name="EditPlan" component={EditPlanScreen}/>
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen}/>
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params?.planTitle || 'Chat',
            headerStyle: {
              backgroundColor: theme.primary,
            },
            headerTintColor: theme.card,
          })}
        />
        <Stack.Screen 
          name="Chats" 
          component={ChatsScreen}
          options={{
            title: 'Chats',
            headerStyle: {
              backgroundColor: theme.primary,
            },
            headerTintColor: theme.card,
          }}
        />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({});
