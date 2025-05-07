import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import BottomTabMenu from '../../components/navigation/BottomTabMenu';

export default function MainScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {user.username || 'Usuario'}!</Text>
      <BottomTabMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#5C4D91' },
});
