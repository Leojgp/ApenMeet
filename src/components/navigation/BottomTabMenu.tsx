import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

interface BottomTabMenuProps {
  navigation: any;
}

const BottomTabMenu: React.FC<BottomTabMenuProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Chats')}>
        <Ionicons name="chatbubble-outline" size={30} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Plans')}>
        <AntDesign name="find" size={30} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Config')}>
        <Ionicons name="settings-outline" size={30} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomTabMenu;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,  
    borderTopWidth: 3,
    borderTopColor: '#e0e0e0', 
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    position: 'absolute',
    bottom: -10, 
    left: '50%',
    marginLeft: -10,  
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: '#fff',  
  },
});
