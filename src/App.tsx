import { StyleSheet} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import MainScreen from './screens/MainScreen';
import ConfigScreen from './screens/configScreens/ConfigScreen';
import PlansScreen from './screens/PlansScreen';
import PlanDetailScreen from './screens/plans/PlansDetailsScreen';
import CreatePlanScreen from './screens/plans/CreatePlanScreen';
import EditProfileScreen from './screens/configScreens/EditProfileScreen';
import { Provider } from 'react-redux';
import { store } from './store';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({});
