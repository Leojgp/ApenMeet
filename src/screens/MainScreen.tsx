import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useUser } from '../hooks/useUser';
import CustomButton from '../components/CustomButtonComponent';

interface MainScreenProps{
  navigation:any
}

export default function MainScreen({navigation}:MainScreenProps) {

  const { user, loading, error } = useUser();

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MainScreen</Text>
      {user && <Text style={styles.username}>Hola, {user.user.username}</Text>}
      <CustomButton title="Click me" screenName='Config' navigation={navigation}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    color: 'gray',
  },
  error: {
    color: 'red',
  },
});
