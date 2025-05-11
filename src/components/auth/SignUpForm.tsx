import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SignUpFormState } from '../../hooks/auth/useSignUpForm';
import * as Location from 'expo-location';
import debounce from 'lodash/debounce';
import { Ionicons } from '@expo/vector-icons';

// Lista de países soportados
const SUPPORTED_COUNTRIES = [
  'Spain', 'France', 'Italy', 'Germany', 'United Kingdom', 'Portugal',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Ireland',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Greece', 'Poland',
  'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia',
  'Slovenia', 'Slovakia', 'Lithuania', 'Latvia', 'Estonia',
  'Cyprus', 'Malta', 'Luxembourg', 'Iceland'
];

interface SignUpFormProps {
  formState: SignUpFormState;
  updateFormState: (field: keyof SignUpFormState, value: any) => void;
  handleSubmit: (location: any) => void;
  pickImage: () => void;
  loading: boolean;
  error: string | null;
  onNavigateToSignIn: () => void;
}

export default function SignUpForm({
  formState,
  updateFormState,
  handleSubmit,
  pickImage,
  loading,
  error,
  onNavigateToSignIn
}: SignUpFormProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(SUPPORTED_COUNTRIES);
  const [searchLocationResult, setSearchLocationResult] = useState<any>(null);

  const requestLocationPermission = async () => {
    try {
      Alert.alert(
        "Permiso de Ubicación",
        "ApenMeet necesita acceder a tu ubicación para mostrarte eventos cercanos y conectarte con personas de tu zona. ¿Quieres permitir el acceso?",
        [
          {
            text: "No, gracias",
            style: "cancel",
            onPress: () => {
              setLocationError("Puedes introducir tu ciudad manualmente");
              setHasRequestedPermission(true);
            }
          },
          {
            text: "Sí, permitir",
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                await getCurrentLocation();
              } else {
                setLocationError("Permiso de ubicación denegado. Puedes introducir tu ciudad manualmente");
              }
              setHasRequestedPermission(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError("Error al solicitar permiso de ubicación");
    }
  };

  useEffect(() => {
    if (!hasRequestedPermission) {
      requestLocationPermission();
    }
  }, [hasRequestedPermission]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode.length > 0) {
        const locationData = reverseGeocode[0];
        updateFormState('location', {
          city: locationData.city || '',
          country: locationData.country || 'Spain',
          coordinates: [longitude, latitude],
          formattedAddress: [
            locationData.street,
            locationData.city,
            locationData.region,
            locationData.postalCode,
            locationData.country
          ].filter(Boolean).join(', '),
          postalCode: locationData.postalCode || '',
          region: locationData.region || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Error al obtener la ubicación');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const clearLocation = () => {
    setCityInput('');
    updateFormState('location', {
      city: '',
      country: '',
      coordinates: [0, 0],
      formattedAddress: '',
      postalCode: '',
      region: '',
      timezone: ''
    });
    setLocationError(null);
  };

  const debouncedSearch = useCallback(
    debounce(async (city: string) => {
      if (city.length < 3) return;

      try {
        setIsLoadingLocation(true);
        setLocationError(null);

        const results = await Location.geocodeAsync(city);
        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude
          });

          if (reverseGeocode.length > 0) {
            const locationData = reverseGeocode[0];
            updateFormState('location', {
              city: locationData.city || city,
              country: locationData.country || 'Spain',
              coordinates: [longitude, latitude],
              formattedAddress: [
                locationData.street,
                locationData.city,
                locationData.region,
                locationData.postalCode,
                locationData.country
              ].filter(Boolean).join(', '),
              postalCode: locationData.postalCode || '',
              region: locationData.region || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Error al obtener la ubicación');
      } finally {
        setIsLoadingLocation(false);
      }
    }, 1000),
    []
  );

  const updateFullLocation = async (city: string, country: string) => {
    if (!city || !country) return;
    try {
      setIsLoadingLocation(true);
      setLocationError(null);
      const query = `${city}, ${country}`;
      console.log('Geocoding query:', query);
      const results = await Location.geocodeAsync(query);
      console.log('Geocode results:', results);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        console.log('Reverse geocode results:', reverseGeocode);
        if (reverseGeocode.length > 0) {
          const locationData = reverseGeocode[0];
          const locationObj = {
            city: locationData.city || city,
            country: locationData.country || country,
            coordinates: [longitude, latitude],
            formattedAddress: [
              locationData.street,
              locationData.city,
              locationData.region,
              locationData.postalCode,
              locationData.country
            ].filter(Boolean).join(', '),
            postalCode: locationData.postalCode || '',
            region: locationData.region || '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
          console.log('Location object to save:', locationObj);
          setSearchLocationResult(locationObj);
          updateFormState('location', locationObj);
        } else {
          setLocationError('No se pudo obtener la dirección completa.');
          setSearchLocationResult(null);
        }
      } else {
        setLocationError('No se encontraron coordenadas para esa ciudad y país.');
        setSearchLocationResult(null);
      }
    } catch (error) {
      setLocationError('Error al obtener la ubicación');
      setSearchLocationResult(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCityChange = (city: string) => {
    setCityInput(city);
    updateFormState('location', {
      ...formState.location,
      city: city
    });
    if (formState.location.country) {
      updateFullLocation(city, formState.location.country);
    }
  };

  const handleCountrySelect = (country: string) => {
    updateFormState('location', {
      ...formState.location,
      country: country
    });
    setShowCountryModal(false);
    if (cityInput) {
      updateFullLocation(cityInput, country);
    }
  };

  const filterCountries = (text: string) => {
    const filtered = SUPPORTED_COUNTRIES.filter(country =>
      country.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  // Nueva función para validar la ubicación antes de submit
  const isLocationValid = () => {
    const loc = formState.location;
    return (
      loc &&
      !!loc.formattedAddress &&
      !!loc.city &&
      !!loc.country &&
      Array.isArray(loc.coordinates) &&
      loc.coordinates[0] !== 0 &&
      loc.coordinates[1] !== 0
    );
  };

  // Envolver handleSubmit para validar ubicación
  const handleSafeSubmit = () => {
    console.log('searchLocationResult before submit:', searchLocationResult);
    if (!searchLocationResult) {
      setLocationError('Por favor selecciona una ubicación válida antes de registrarte.');
      return;
    }
    // Construir objeto JSON para el registro
    const userData = {
      username: formState.username,
      email: formState.email,
      password: formState.password,
      bio: formState.bio,
      city: searchLocationResult.city ? String(searchLocationResult.city) : '',
      country: searchLocationResult.country ? String(searchLocationResult.country) : '',
      coordinates: [
        searchLocationResult.coordinates && searchLocationResult.coordinates[0] !== undefined ? Number(searchLocationResult.coordinates[0]) : 0,
        searchLocationResult.coordinates && searchLocationResult.coordinates[1] !== undefined ? Number(searchLocationResult.coordinates[1]) : 0
      ],
      formattedAddress: searchLocationResult.formattedAddress ? String(searchLocationResult.formattedAddress) : '',
      postalCode: searchLocationResult.postalCode ? String(searchLocationResult.postalCode) : '',
      region: searchLocationResult.region ? String(searchLocationResult.region) : '',
      timezone: searchLocationResult.timezone ? String(searchLocationResult.timezone) : '',
      interests: formState.interests ? String(formState.interests) : ''
    };
    console.log('JSON being sent:', userData);
    handleSubmit(userData);
  };

  // Sincroniza el país del formulario con el resultado de la búsqueda
  useEffect(() => {
    if (searchLocationResult && searchLocationResult.country) {
      updateFormState('location', {
        ...formState.location,
        country: searchLocationResult.country
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLocationResult?.country]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formState.username}
        onChangeText={(text) => updateFormState('username', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formState.email}
        onChangeText={(text) => updateFormState('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formState.password}
        onChangeText={(text) => updateFormState('password', text)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formState.confirmPassword}
        onChangeText={(text) => updateFormState('confirmPassword', text)}
        secureTextEntry
      />
      
      <View style={styles.locationContainer}>
        <View style={styles.cityInputContainer}>
          <TextInput
            style={[styles.input, cityInput && styles.inputWithClear]}
            placeholder="City"
            value={cityInput}
            onChangeText={handleCityChange}
          />
          {cityInput && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearLocation}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.countryButton}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={styles.countryButtonText}>
            {formState.location.country || 'Select Country'}
          </Text>
        </TouchableOpacity>

        {isLoadingLocation && (
          <ActivityIndicator style={styles.locationLoader} color="#5C4D91" />
        )}
        {locationError && (
          <Text style={styles.errorText}>{locationError}</Text>
        )}
        {formState.location.formattedAddress && (
          <Text style={styles.locationText}>
            {formState.location.formattedAddress}
          </Text>
        )}
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.locationButtonText}>Usar mi ubicación actual</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              onChangeText={filterCountries}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleSafeSubmit}
        disabled={loading || isLoadingLocation || !searchLocationResult}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6E0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#5C4D91',
    fontSize: 16,
  },
  input: {
    height: 48,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  locationContainer: {
    width: '100%',
    marginBottom: 16,
  },
  locationLoader: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  locationText: {
    color: '#5C4D91',
    marginTop: 8,
    fontSize: 14,
  },
  locationButton: {
    backgroundColor: '#E6E0F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#5C4D91',
    fontSize: 14,
    fontWeight: '500',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkText: {
    color: '#5C4D91',
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  cityInputContainer: {
    position: 'relative',
    width: '100%',
  },
  inputWithClear: {
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E6E0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#5C4D91',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  countryButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  countryButtonText: {
    color: '#5C4D91',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1C4E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  countryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E0F8',
  },
  countryItemText: {
    fontSize: 16,
    color: '#5C4D91',
  },
  closeButton: {
    backgroundColor: '#5C4D91',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 