import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking, Modal } from 'react-native';
import * as Location from 'expo-location';
import { updateUser } from '../../api/user/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/userSlice';
import { RootState } from '../../store';

interface LocationRequestProps {
  onLocationSet: () => void;
}

export default function LocationRequest({ onLocationSet }: LocationRequestProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permiso de ubicación denegado',
          'Para usar esta función, necesitamos acceso a tu ubicación. ¿Quieres abrir la configuración para permitir el acceso?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: onLocationSet
            },
            {
              text: 'Sí, abrir configuración',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
      Alert.alert('Error', 'No se pudo solicitar el permiso de ubicación');
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
      formData.append('location', JSON.stringify({
        city,
        coordinates: [location.coords.longitude, location.coords.latitude]
      }));

      await updateUser(formData);

      dispatch(setUser({
        ...currentUser,
        location: {
          city,
          coordinates: [location.coords.longitude, location.coords.latitude]
        }
      }));

      onLocationSet();
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>¿Dónde estás?</Text>
          <Text style={styles.description}>
            Para mostrarte planes cerca de ti, necesitamos tu ubicación
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={requestLocationPermission}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Obteniendo ubicación...' : 'Compartir ubicación'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={onLocationSet}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Omitir por ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#E6E0F8',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#5C4D91',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#5C4D91',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 