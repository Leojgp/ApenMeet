// src/screens/SignInScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../models/navigation';
import { useTheme } from '../../hooks/theme/useTheme';

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
type SignInScreenRouteProp = RouteProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const { handleLogin, loading, error } = useAuth({ navigation: useNavigation() });
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const route = useRoute<SignInScreenRouteProp>();
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const redirectTo = route.params?.redirectTo;
  const planId = route.params?.planId;

  const handleSignIn = async () => {
    try {
      await handleLogin(email, password);
      if (redirectTo && planId) {
        if (redirectTo === 'PlanDetail') {
          navigation.navigate('PlanDetail', { planId });
        } else if (redirectTo === 'Chat') {
          navigation.navigate('Chat', { planId });
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('auth.signIn.title')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signIn.email')}
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signIn.password')}
        placeholderTextColor={theme.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.card }]}>
          {loading ? t('auth.signIn.loading') : t('auth.signIn.submit')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp', { redirectTo, planId })}
      >
        <Text style={[styles.link, { color: theme.primary }]}>{t('auth.signIn.signUpLink')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
});
