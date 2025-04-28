import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useUser } from '../hooks/useUser';
import BottomTabMenu from '../components/navigation/BottomTabMenu';

interface MainScreenProps{
  navigation:any
}

export default function MainScreen({navigation}:MainScreenProps) {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C4D91" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      {user && <Text style={styles.username}>Hi, {user.user.username}</Text>}
      <BottomTabMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
  },
  error: {
    color: 'red',
  },
});
