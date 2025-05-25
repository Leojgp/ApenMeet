import React, { useEffect } from 'react';
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
import BottomTabs from './components/navigation/BottomTabs';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { RootStackParamList } from './models/navigation';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@env';

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['apenmeet://', 'https://apenmeet.app'],
  config: {
    screens: {
      PlanDetail: {
        path: 'plan/:planId',
        parse: {
          planId: (planId: string) => planId,
        },
      },
    },
  },
};

WebBrowser.maybeCompleteAuthSession();

function AppContent() {
  const theme = useTheme();
  const isAuthenticated = useSelector((state: RootState) => !!state.user._id);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID
  });

  useEffect(() => { 
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Authentication successful:', authentication);
    } else if (response?.type === 'error') {
        console.error('Authentication error:', response.error);
    }
  }, [response]);

  return (
    <NavigationContainer linking={linking}>
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
      <I18nextProvider i18n={i18n}>
        <AppContent />
      </I18nextProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({});
