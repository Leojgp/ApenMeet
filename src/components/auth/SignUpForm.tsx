import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { SignUpFormState } from '../../hooks/auth/useSignUpForm';

interface SignUpFormProps {
  formState: SignUpFormState;
  updateFormState: (field: keyof SignUpFormState, value: any) => void;
  handleSubmit: () => void;
  pickImage: () => void;
  loading: boolean;
  error: string | null;
  onNavigateToSignIn: () => void;
}

export default function SignUpForm({
  formState,
  updateFormState,
  handleSubmit,
  pickImage,
  loading,
  error,
  onNavigateToSignIn
}: SignUpFormProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('username', value)}
        value={formState.username}
        placeholder="Username"
        placeholderTextColor="#A9A9A9"
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('email', value)}
        value={formState.email}
        placeholder="Email Address"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('password', value)}
        value={formState.password}
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('bio', value)}
        value={formState.bio}
        placeholder="Bio"
        placeholderTextColor="#A9A9A9"
        multiline
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('location', { ...formState.location, city: value })}
        value={formState.location.city}
        placeholder="City"
        placeholderTextColor="#A9A9A9"
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => updateFormState('interests', value)}
        value={formState.interests}
        placeholder="Interests (comma separated)"
        placeholderTextColor="#A9A9A9"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToSignIn}>
        <Text style={styles.linkText}>Already have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6E0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#5C4D91',
    fontSize: 16,
  },
  input: {
    height: 48,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  button: {
    backgroundColor: '#5C4D91',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  linkText: {
    color: '#5C4D91',
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
}); 