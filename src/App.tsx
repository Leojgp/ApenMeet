import { StyleSheet} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen, MainScreen } from './screens/home';
import { SignUpScreen, SignInScreen } from './screens/auth';
import { PlansScreen, CreatePlanScreen, PlanDetailScreen } from './screens/plans';
import { ConfigScreen, EditProfileScreen } from './screens';
import { ChatScreen } from './screens/chat';
import { Provider } from 'react-redux';
import { store } from './store';
import { useUser } from './hooks/user/useUser';

type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Main: undefined;
  Config: undefined;
  Plans: undefined;
  PlanDetail: { planId: string };
  CreatePlan: undefined;
  EditProfileScreen: undefined;
  Chat: { planId: string; planTitle: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={({ navigation }) => ({
            headerLeft: () => null,
            gestureEnabled: false
          })}
        />
        <Stack.Screen name="Config" component={ConfigScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Plans" component={PlansScreen}/>
        <Stack.Screen name="PlanDetail" component={PlanDetailScreen}/>
        <Stack.Screen name="CreatePlan" component={CreatePlanScreen}/>
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen}/>
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params?.planTitle || 'Chat',
            headerStyle: {
              backgroundColor: '#5C4D91',
            },
            headerTintColor: '#fff',
          })}
        />
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
