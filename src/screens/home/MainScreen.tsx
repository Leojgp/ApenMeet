import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import BottomTabMenu from '../../components/navigation/BottomTabMenu';
import LocationRequest from '../../components/auth/LocationRequest';

export default function MainScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user);
  const [showLocationRequest, setShowLocationRequest] = useState(
    !user.location?.coordinates || 
    (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)
  );

  const handleLocationSet = () => {
    setShowLocationRequest(false);
  };

  if (showLocationRequest) {
    return <LocationRequest onLocationSet={handleLocationSet} />;
  }

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
