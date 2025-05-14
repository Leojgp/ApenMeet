import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useTheme } from '../../hooks/theme/useTheme'
import ThemeToggle from '../../components/theme/ThemeToggle'

interface HomeScreenProps{
    navigation:any
}

export default function HomeScreen({navigation}:HomeScreenProps) {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>  
      <View style={styles.toggleContainer}>
        <ThemeToggle />
      </View>
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/ApenMeetImages/logo.png')} style={styles.logoImage} />
        <Text style={[styles.logoText, { color: theme.text }]}>ÅpenMeet</Text>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('SignUp')}>
        <Text style={[styles.buttonText, { color: theme.primary }]}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.buttonText, { color: theme.primary }]}>Log In</Text>
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
  toggleContainer: {
    position: 'absolute',
    top: 70,
    right: 24,
    zIndex: 10,
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