import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store'; 

const LogoutButton: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleLogout = async () => {

    console.log('Eliminando Tokens...');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('accessToken');
    
    navigation.navigate('Home');
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
      <Ionicons name="log-out-outline" size={30} color="gray" />
    </TouchableOpacity>
  );
};

export default LogoutButton;
