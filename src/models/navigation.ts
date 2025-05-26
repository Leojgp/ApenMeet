import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Home: undefined;
  SignUp: { redirectTo?: string; planId?: string };
  SignIn: { redirectTo?: string; planId?: string };
  Tabs: undefined;
  Config: undefined;
  Plans: undefined;
  PlanDetail: { planId: string };
  CreatePlan: undefined;
  EditPlan: { planId: string };
  ManageAdmins: { planId: string };
  EditProfileScreen: undefined;
  Chat: { planId: string; planTitle?: string };
  Chats: undefined;
  EventDetails: { event: any };
  Profile: { userId?: string; username?: string };
  UserProfile: { userId: string; username: string };
};

export type TabParamList = {
  Home: undefined;
  Plans: undefined;
  Chats: undefined;
  Config: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>; 