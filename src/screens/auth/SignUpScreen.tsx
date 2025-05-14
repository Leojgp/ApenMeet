import { StyleSheet, Text, SafeAreaView } from 'react-native';
import { useSignUpForm } from '../../hooks/auth/useSignUpForm';
import SignUpForm from '../../components/auth/SignUpForm';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

export default function SignUpScreen({ navigation }: any) {
  const {
    formState,
    updateFormState,
    handleSubmit,
    pickImage,
    loading,
    error
  } = useSignUpForm(navigation);
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('auth.signUp.title')}</Text>
      <SignUpForm
        formState={formState}
        updateFormState={updateFormState}
        handleSubmit={handleSubmit}
        pickImage={pickImage}
        loading={loading}
        error={error}
        onNavigateToSignIn={() => navigation.navigate('SignIn')}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 160,
  },
});