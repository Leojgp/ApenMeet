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
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@env';
import { loginWithGoogle } from '../../api/auth/authApi';
import * as SecureStore from 'expo-secure-store';

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

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID
  });

  const redirectTo = route.params?.redirectTo;
  const planId = route.params?.planId;

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google Auth Response:', authentication);
      
      if (authentication?.accessToken) {
        loginWithGoogle(authentication.accessToken)
          .then(response => {
            console.log('Respuesta del backend:', response);
            if (response.success) {

              setEmail(response.user.email);
              handleLogin(response.user.email, '', authentication.accessToken);
            }
          })
          .catch(error => {
            console.error('Error en login con Google:', error);
            Alert.alert('Error', error.message);
          });
      }
    }
  }, [response]);

  const handleGooglePress = async () => {
    try {
      const result = await promptAsync();
      console.log('Resultado de Google Sign In:', result);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('Iniciando proceso de login con:', { email, password });
      await handleLogin(email, password);
      console.log('Login completado');
      if (redirectTo && planId) {
        if (redirectTo === 'PlanDetail') {
          navigation.navigate('PlanDetail', { planId });
        } else if (redirectTo === 'Chat') {
          navigation.navigate('Chat', { planId });
        }
      }
    } catch (error: any) {
      console.error('Error en SignInScreen:', error);
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
      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.card }]}>
          {loading ? t('auth.signIn.loading') : t('auth.signIn.submit')}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.text }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, { backgroundColor: theme.card }]}
        onPress={handleGooglePress}
        disabled={!request}
      >
        <Text style={[styles.googleButtonText, { color: theme.text }]}>
          {t('auth.signIn.google')}
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'red',
  },
});
