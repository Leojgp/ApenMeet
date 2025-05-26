import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import ThemeToggle from '../../components/theme/ThemeToggle';
import LanguageToggle from '../../components/common/LanguageToggle';
import { useTheme } from '../../hooks/theme/useTheme';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../store/userSlice';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

const options = [
  { icon: <Ionicons name="person-circle-outline" size={30} color="#5C4D91" />, label: 'config.editProfile' },
  { icon: <Ionicons name="notifications-outline" size={26} color="#5C4D91" />, label: 'config.notifications' },
  { icon: <Feather name="lock" size={26} color="#5C4D91" />, label: 'config.privacy' },
  { icon: <Feather name="help-circle" size={26} color="#5C4D91" />, label: 'config.help' },
  { icon: <MaterialIcons name="info-outline" size={26} color="#5C4D91" />, label: 'config.about' },
];

interface ConfigScreenProps {
  navigation: any;
}

export default function ConfigScreen({ navigation }: ConfigScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    dispatch(clearUser());
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: 'bold', margin: 20 }}>Configuración</Text>
      <View style={{ gap: 16, paddingHorizontal: 16 }}>
        {options.map((opt, idx) => (
          <TouchableOpacity 
            key={opt.label} 
            style={[styles.option, { backgroundColor: theme.card }]}
            onPress={() => {
              if (opt.label === 'config.editProfile') navigation.navigate('EditProfileScreen');
            }}
          >
            {opt.icon}
            <Text style={[styles.optionText, { color: theme.text }]}>{t(opt.label)}</Text>
          </TouchableOpacity>
        ))}
        <View style={[styles.option, { backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="moon" size={24} color={theme.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.text }]}>{t('config.darkMode', 'Modo Oscuro')}</Text>
          </View>
          <ThemeToggle />
        </View>
        <View style={[styles.option, { backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="language-outline" size={24} color={theme.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.text }]}>{t('config.language')}</Text>
          </View>
          <LanguageToggle />
        </View>
      </View>
      <TouchableOpacity 
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: theme.card }]}
      >
        <Text style={styles.logoutText}>{t('config.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  icon: {
    marginRight: 8,
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