import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking, Modal } from 'react-native';
import * as Location from 'expo-location';
import { updateUser } from '../../api/user/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/userSlice';
import { RootState } from '../../store';
import { useTranslation } from 'react-i18next';

interface LocationRequestProps {
  onLocationSet: (location: { latitude: number; longitude: number }) => void;
}

export default function LocationRequest({ onLocationSet }: LocationRequestProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación requerido',
          'Necesitamos acceso a tu ubicación para mostrarte planes cercanos a ti.',
          [
            {
              text: 'Ir a Configuración',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancelar',
              style: 'cancel',
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const formattedAddress = address ? 
        `${address.street}, ${address.city}, ${address.region}, ${address.country}` :
        `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;

      const city = address?.city || '';

      const formData = new FormData();
      formData.append('location[city]', city);
      formData.append('location[coordinates][]', String(location.coords.longitude));
      formData.append('location[coordinates][]', String(location.coords.latitude));

      const response = await updateUser(formData);
      console.log('Location update response:', response);

      dispatch(setUser({
        ...currentUser,
        location: {
          city,
          coordinates: [location.coords.longitude, location.coords.latitude],
          country: '',
          formattedAddress: ''
        }
      }));

      onLocationSet({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      await getCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('location.permission.title')}</Text>
      <Text style={styles.message}>{t('location.permission.message')}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('location.permission.loading') : t('location.permission.allow')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E6E0F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#5C4D91',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 