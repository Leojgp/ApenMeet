import { StyleSheet, Text, SafeAreaView } from 'react-native';
import { useSignUpForm } from '../../hooks/auth/useSignUpForm';
import SignUpForm from '../../components/auth/SignUpForm';

export default function SignUpScreen({ navigation }: any) {
  const {
    formState,
    updateFormState,
    handleSubmit,
    pickImage,
    loading,
    error
  } = useSignUpForm();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <SignUpForm
        formState={formState}
        updateFormState={updateFormState}
        handleSubmit={handleSubmit}
        pickImage={pickImage}
        loading={loading}
        error={error}
        onNavigateToSignIn={() => navigation.navigate('SignIn')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E0F8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 40,
  },
});