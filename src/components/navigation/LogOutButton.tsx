import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface LogoutButtonProps {
  navigation: any;
}

function LogoutButton({ navigation }: LogoutButtonProps){

  return (
    <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={{ marginRight: 10 }}>
      <Ionicons name="log-out-outline" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default LogoutButton;
