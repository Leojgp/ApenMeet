// src/screens/SignInScreen.tsx
import { SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../hooks/theme/useTheme';

interface SignInProps {
  navigation: any;
}

export default function SignInScreen({ navigation }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, loading, error } = useAuth({navigation});
  const theme = useTheme();

  const onSubmit = async () => {
    await handleLogin(email, password);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Log In</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          onChangeText={setEmail}
          value={email}
          placeholder="Email Address"
          placeholderTextColor={theme.placeholder}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
        />
        {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={onSubmit} disabled={loading}>
          <Text style={[styles.buttonText, { color: theme.card }]}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.linkText, { color: theme.primary }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    height: 48,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
