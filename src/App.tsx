import { StyleSheet} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import MainScreen from './screens/MainScreen';
import ConfigScreen from './screens/configScreens/ConfigScreen';
import LogoutButton from './components/navigation/LogOutButton';
import PlansScreen from './screens/PlansScreen';
import PlanDetailScreen from './screens/plans/PlansDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
