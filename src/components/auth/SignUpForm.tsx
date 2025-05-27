import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SignUpFormState } from '../../hooks/auth/useSignUpForm';
import * as Location from 'expo-location';
import debounce from 'lodash/debounce';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

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
  navigation: any;
}

export default function SignUpForm({
  formState,
  updateFormState,
  handleSubmit,
  pickImage,
  loading,
  error,
  onNavigateToSignIn,
  navigation
}: SignUpFormProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(SUPPORTED_COUNTRIES);
  const [searchLocationResult, setSearchLocationResult] = useState<any>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const requestLocationPermission = async () => {
    try {
      Alert.alert(
        t('alerts.location.title'),
        t('alerts.location.message'),
        [
          {
            text: t('alerts.location.deny'),
            style: "cancel",
            onPress: () => {
              setLocationError(t('location.permission.message'));
              setHasRequestedPermission(true);
            }
          },
          {
            text: t('alerts.location.allow'),
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                await getCurrentLocation();
              } else {
                setLocationError(t('location.permission.message'));
              }
              setHasRequestedPermission(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError(t('alerts.errors.location'));
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


  const handleSafeSubmit = () => {
    console.log('searchLocationResult before submit:', searchLocationResult);
    if (!searchLocationResult) {
      setLocationError('Por favor selecciona una ubicación válida antes de registrarte.');
      return;
    }

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


  useEffect(() => {
    if (searchLocationResult && searchLocationResult.country) {
      updateFormState('location', {
        ...formState.location,
        country: searchLocationResult.country
      });
    }

  }, [searchLocationResult?.country]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signUp.username')}
        placeholderTextColor={theme.placeholder}
        value={formState.username}
        onChangeText={(text) => updateFormState('username', text)}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signUp.email')}
        placeholderTextColor={theme.placeholder}
        value={formState.email}
        onChangeText={(text) => updateFormState('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signUp.password')}
        placeholderTextColor={theme.placeholder}
        value={formState.password}
        onChangeText={(text) => updateFormState('password', text)}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signUp.confirmPassword')}
        placeholderTextColor={theme.placeholder}
        value={formState.confirmPassword}
        onChangeText={(text) => updateFormState('confirmPassword', text)}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('auth.signUp.bio')}
        placeholderTextColor={theme.placeholder}
        value={formState.bio}
        onChangeText={(text) => updateFormState('bio', text)}
        multiline
        numberOfLines={4}
      />
      
      <View style={styles.locationContainer}>
        <TouchableOpacity 
          style={[styles.countryButton, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 16 }]}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={[styles.countryButtonText, { color: theme.primary }]}>
            {formState.location.country || t('auth.signUp.selectCountry')}
          </Text>
        </TouchableOpacity>

        <View style={styles.cityInputContainer}>
          <TextInput
            style={[styles.input, cityInput && styles.inputWithClear, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder={t('auth.signUp.city')}
            placeholderTextColor={theme.placeholder}
            value={cityInput}
            onChangeText={handleCityChange}
          />
          {cityInput && (
            <TouchableOpacity 
              style={[styles.clearButton, { backgroundColor: theme.card }]}
              onPress={clearLocation}
            >
              <Text style={[styles.clearButtonText, { color: theme.primary }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoadingLocation && (
          <ActivityIndicator style={styles.locationLoader} color={theme.primary} />
        )}
        {locationError && (
          <Text style={[styles.errorText, { color: theme.error }]}>{locationError}</Text>
        )}
        {formState.location.formattedAddress && (
          <Text style={[styles.locationText, { color: theme.primary }]}>
            {formState.location.formattedAddress}
          </Text>
        )}
        <TouchableOpacity 
          style={[styles.locationButton, { backgroundColor: theme.card }]}
          onPress={requestLocationPermission}
        >
          <Text style={[styles.locationButtonText, { color: theme.primary }]}>{t('auth.signUp.useLocation')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder={t('auth.signUp.searchCountry')}
              placeholderTextColor={theme.placeholder}
              onChangeText={filterCountries}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={[styles.countryItemText, { color: theme.primary }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.card }]}>{t('auth.signUp.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleSafeSubmit}
        disabled={loading || isLoadingLocation || !searchLocationResult}
      >
        <Text style={[styles.buttonText, { color: theme.card }]}>
          {loading ? t('auth.signUp.loading') : t('auth.signUp.submit')}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
      <TouchableOpacity onPress={onNavigateToSignIn}>
        <Text style={[styles.linkText, { color: theme.primary }]}>{t('auth.signIn.signUpLink')}</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
  input: {
    height: 48,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
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
    marginTop: 8,
    fontSize: 14,
  },
  locationButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  linkText: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  countryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  countryButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  countryItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  countryItemText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
}); 