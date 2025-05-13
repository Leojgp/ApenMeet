import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void;
  initialLocation?: { address: string; coordinates: [number, number] } | null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [region, setRegion] = useState({
    latitude: initialLocation?.coordinates?.[1] || 40.4168,
    longitude: initialLocation?.coordinates?.[0] || -3.7038,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else if (status === 'denied') {
        setLocationPermissionDenied(true);
        Alert.alert(
          'Permiso de ubicación denegado',
          'Para usar esta función, necesitamos acceso a tu ubicación. ¿Quieres abrir la configuración para permitir el acceso?',
          [
            {
              text: 'No',
              style: 'cancel'
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
      } else {
        requestLocationPermission();
      }
    } catch (error) {
      console.log('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        setLocationPermissionDenied(true);
        Alert.alert(
          'Permiso de ubicación requerido',
          'Para usar esta función, necesitamos acceso a tu ubicación.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const coords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(coords);
      setLocationPermissionDenied(false);
      
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const formattedAddress = address ? 
        `${address.street}, ${address.city}, ${address.region}, ${address.country}` :
        `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;

      setSearchQuery(formattedAddress);
      setRegion(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      setSelectedLocation(coords);
      onLocationSelect({
        address: formattedAddress,
        coordinates: coords
      });
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert(
        'Error de ubicación',
        'No se pudo obtener tu ubicación. Por favor, asegúrate de tener el GPS activado.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      const formattedAddress = address ? 
        `${address.street}, ${address.city}, ${address.region}, ${address.country}` :
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setSearchQuery(formattedAddress);
      setSelectedLocation([longitude, latitude]);
      onLocationSelect({
        address: formattedAddress,
        coordinates: [longitude, latitude]
      });
    } catch (error) {
      console.log('Error getting address:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
        setSelectedLocation([longitude, latitude]);
        onLocationSelect({
          address: searchQuery,
          coordinates: [longitude, latitude]
        });
      }
    } catch (error) {
      console.log('Error searching location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar ubicación..."
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#5C4D91" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.locationButton, locationPermissionDenied && styles.locationButtonDisabled]} 
          onPress={locationPermissionDenied ? checkLocationPermission : getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color={locationPermissionDenied ? "#999" : "#5C4D91"} />
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onPress={handleMapPress}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation[1],
              longitude: userLocation[0]
            }}
            pinColor="blue"
          />
        )}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation[1],
              longitude: selectedLocation[0]
            }}
            pinColor="red"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
  },
  locationButton: {
    padding: 8,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  map: {
    flex: 1,
  },
}); 