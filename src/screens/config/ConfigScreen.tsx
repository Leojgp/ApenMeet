import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import ThemeToggle from '../../components/theme/ThemeToggle';
import { useTheme } from '../../hooks/theme/useTheme';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../store/userSlice';
import * as SecureStore from 'expo-secure-store';

const options = [
  { icon: <Ionicons name="person-circle-outline" size={30} color="#5C4D91" />, label: 'Edit Profile' },
  { icon: <Ionicons name="notifications-outline" size={26} color="#5C4D91" />, label: 'Notifications' },
  { icon: <Feather name="lock" size={26} color="#5C4D91" />, label: 'Privacy' },
  { icon: <Feather name="help-circle" size={26} color="#5C4D91" />, label: 'Help' },
  { icon: <MaterialIcons name="info-outline" size={26} color="#5C4D91" />, label: 'About' },
];

interface ConfigScreenProps {
  navigation: any;
}

export default function ConfigScreen({ navigation }: ConfigScreenProps) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    dispatch(clearUser());
  };

  return (
    <ScrollView style={[styles.bg, { backgroundColor: theme.background }]} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <View style={styles.optionsList}>
        {options.map((opt, idx) => (
          <TouchableOpacity 
            key={opt.label} 
            style={[styles.optionRow, { backgroundColor: theme.card }]}
            onPress={() => {
              if (opt.label === 'Edit Profile') navigation.navigate('EditProfileScreen');
            }}
          >
            {opt.icon}
            <Text style={[styles.optionText, { color: theme.text }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={[styles.optionRow, { backgroundColor: theme.card }]}>
          <Ionicons name="moon-outline" size={26} color={theme.primary} />
          <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
          <View style={styles.toggleContainer}>
            <ThemeToggle />
          </View>
        </View>
      </View>
      <TouchableOpacity 
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: theme.card }]}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 32,
    textAlign: 'left',
  },
  optionsList: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 8,
    marginBottom: 32,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionText: {
    fontSize: 22,
    marginLeft: 22,
    fontWeight: '500',
    flex: 1,
  },
  toggleContainer: {
    marginLeft: 'auto',
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutText: {
    color: '#f44336',
    fontSize: 20,
    fontWeight: 'bold',
  },
});