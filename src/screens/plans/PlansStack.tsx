import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlansScreen, CreatePlanScreen, PlanDetailScreen, EditPlanScreen, ManageAdminsScreen } from '.';
import { useTheme } from '../../hooks/theme/useTheme';

const Stack = createNativeStackNavigator();

export default function PlansStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="PlansScreen"
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { color: theme.text },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen name="PlansScreen" component={PlansScreen} options={{ title: 'Plans' }} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} options={{ title: 'Crear plan' }} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'Detalle del plan' }} />
      <Stack.Screen name="EditPlan" component={EditPlanScreen} options={{ title: 'Editar plan' }} />
      <Stack.Screen name="ManageAdmins" component={ManageAdminsScreen} options={{ title: 'Gestionar administradores' }} />
    </Stack.Navigator>
  );
} 