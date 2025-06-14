import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useTheme } from '../../hooks/theme/useTheme'
import ThemeToggle from '../../components/common/ThemeToggle'
import LanguageToggle from '../../components/common/LanguageToggle'
import { useTranslation } from 'react-i18next';

interface HomeScreenProps{
    navigation:any
}

export default function HomeScreen({navigation}:HomeScreenProps) {
  const theme = useTheme()
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>  
      <View style={styles.header}>
        <ThemeToggle />
        <LanguageToggle />
      </View>
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/ApenMeetImages/logo.png')} style={styles.logoImage} />
        <Text style={[styles.logoText, { color: theme.text }]}>ÅpenMeet</Text>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('SignUp')}>
        <Text style={[styles.buttonText, { color: theme.primary }]}>{t('auth.signUp.title')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.buttonText, { color: theme.primary }]}>{t('auth.signIn.title')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});