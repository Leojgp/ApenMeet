import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateUser } from '../../api/user/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/theme/useTheme';
import debounce from 'lodash/debounce';

const SUPPORTED_COUNTRIES = [
  'Spain', 'France', 'Germany', 'Italy', 'Portugal', 'United Kingdom', 'United States', 'Argentina', 'Mexico', 'Colombia', 'Chile', 'Peru', 'Brazil', 'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 'Canada', 'Australia', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Greece', 'Turkey', 'Russia', 'China', 'Japan', 'South Korea', 'India', 'South Africa', 'Egypt', 'Morocco', 'Algeria', 'Nigeria', 'Kenya', 'Israel', 'Saudi Arabia', 'UAE', 'Qatar', 'Singapore', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines', 'New Zealand', 'Ireland', 'Romania', 'Hungary', 'Bulgaria', 'Croatia', 'Slovakia', 'Slovenia', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Monaco', 'Andorra', 'Liechtenstein', 'San Marino', 'Malta', 'Cyprus', 'Iceland'
];

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    bio: '',
    location: { 
      city: '', 
      country: 'Spain',
      coordinates: [0, 0] as [number, number],
      formattedAddress: '',
      postalCode: '',
      region: '',
      timezone: ''
    },
    interests: '',
    profileImage: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cityInput, setCityInput] = useState(form.location.city || '');
  const [country, setCountry] = useState(form.location.country || '');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(SUPPORTED_COUNTRIES);
  const [formattedAddress, setFormattedAddress] = useState(form.location.formattedAddress || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [searchLocationResult, setSearchLocationResult] = useState<any>(null);

  const debouncedSearch = useCallback(
    debounce(async (city: string, country: string) => {
      if (city.length < 3 || !country) return;
      setIsLoadingLocation(true);
      setLocationError('');
      try {
        const query = `${city}, ${country}`;
        const results = await Location.geocodeAsync(query);
        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (reverseGeocode.length > 0) {
            const locationData = reverseGeocode[0];
            const locationObj = {
              city: locationData.city || city,
              country: locationData.country || country,
              coordinates: [longitude, latitude],
              formattedAddress: locationData.formattedAddress || `${city}, ${country}`,
              postalCode: locationData.postalCode || '',
              region: locationData.region || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            setFormattedAddress(locationObj.formattedAddress);
            setSearchLocationResult(locationObj);
          }
        } else {
          setFormattedAddress('');
          setLocationError('No se encontraron coordenadas para esa ciudad y país.');
          setSearchLocationResult(null);
        }
      } catch (e) {
        setLocationError('Error buscando la ciudad.');
        setSearchLocationResult(null);
      } finally {
        setIsLoadingLocation(false);
      }
    }, 1000),
    [country]
  );

  useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then((data) => {
        const profileImage = data.user.profileImage || 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746874674/default_Profile_Image_oiw2nt.webp';
        setForm({
          id: data.user._id || data.user.id || '',
          username: data.user.username || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          location: data.user.location || { city: '', country: '', coordinates: [0, 0], formattedAddress: '', postalCode: '', region: '', timezone: '' },
          interests: Array.isArray(data.user.interests) ? data.user.interests.join(', ') : (data.user.interests || ''),
          profileImage: profileImage,
        });
        dispatch(setUser({
          _id: data.user._id || data.user.id || '',
          username: data.user.username || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          location: data.user.location || { city: '', country: '', coordinates: [0, 0], formattedAddress: '', postalCode: '', region: '', timezone: '' },
          interests: Array.isArray(data.user.interests) ? data.user.interests : [],
          profileImage: profileImage,
          rating: data.user.rating || 0,
          joinedAt: data.user.joinedAt || '',
          isVerified: data.user.isVerified || false
        }));
      })
      .catch((err) => {
        setError(t('profile.edit.errorLoading'));
      })
      .finally(() => setLoading(false));
  }, [dispatch, t]);

  useEffect(() => {
    setCityInput(form.location.city || '');
    setCountry(form.location.country || '');
    setFormattedAddress(form.location.formattedAddress || '');
  }, [form.location]);

  useEffect(() => {
    if (searchLocationResult) {
      setForm(user => ({
        ...user,
        location: {
          ...user.location,
          ...searchLocationResult
        }
      }));
    }
  }, [searchLocationResult]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('alerts.errors.image'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.cancelled && result.assets && result.assets[0].uri) {
      setForm((prev) => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (form.location.coordinates[0] === 0 && form.location.coordinates[1] === 0) {
        try {
          const results = await Location.geocodeAsync(form.location.city);
          if (results.length > 0) {
            const { latitude, longitude } = results[0];
            form.location.coordinates = [longitude, latitude];
          }
        } catch (geoError) {}
      }
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('bio', form.bio);
      formData.append('location[city]', form.location.city);
      formData.append('location[country]', form.location.country);
      formData.append('location[coordinates][]', String(form.location.coordinates[0]));
      formData.append('location[coordinates][]', String(form.location.coordinates[1]));
      formData.append('location[formattedAddress]', form.location.formattedAddress || '');
      formData.append('location[postalCode]', form.location.postalCode || '');
      formData.append('location[region]', form.location.region || '');
      formData.append('location[timezone]', form.location.timezone || '');
      formData.append('interests', form.interests);
      if (form.profileImage && form.profileImage.startsWith('file')) {
        const uriParts = form.profileImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('profileImage', {
          uri: form.profileImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
      const response = await updateUser(formData);
      dispatch(setUser({
        _id: form.id,
        username: form.username,
        email: form.email,
        bio: form.bio,
        location: { 
          city: form.location.city,
          country: form.location.country,
          coordinates: form.location.coordinates,
          formattedAddress: form.location.formattedAddress,
          postalCode: form.location.postalCode,
          region: form.location.region,
          timezone: form.location.timezone
        },
        interests: form.interests.split(',').map(i => i.trim()),
        profileImage: response.user.profileImage || form.profileImage,
        rating: response.user.rating || 0,
        joinedAt: response.user.joinedAt || '',
        isVerified: response.user.isVerified || false
      }));
      navigation.goBack();
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        JSON.stringify(e)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCityChange = (city: string) => {
    setCityInput(city);
    setFormattedAddress('');
    setLocationError('');
    setSearchLocationResult(null);
    debouncedSearch(city, country);
  };

  const handleCitySubmit = () => {
    debouncedSearch.flush();
  };

  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setShowCountryModal(false);
    if (cityInput) {
      debouncedSearch(cityInput, selectedCountry);
    }
  };

  const filterCountries = (text: string) => {
    setFilteredCountries(
      SUPPORTED_COUNTRIES.filter(country => country.toLowerCase().includes(text.toLowerCase()))
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={[styles.bg, { backgroundColor: theme.background }]} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('profile.edit.title')}</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {form.profileImage ? (
          <Image 
            source={{ uri: form.profileImage }} 
            style={styles.profileImage}
            onError={(e) => {
              setForm(prev => ({
                ...prev,
                profileImage: 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746636109/apenmeet/dljiilozwzcmyinqaaeo.jpg'
              }));
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{t('profile.edit.addPhoto')}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder={t('profile.edit.username')} value={form.username} onChangeText={v => setForm(user => ({ ...user, username: v }))} placeholderTextColor={theme.placeholder} />
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder={t('profile.edit.email')} value={form.email} onChangeText={v => setForm(user => ({ ...user, email: v }))} placeholderTextColor={theme.placeholder} />
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder={t('profile.edit.bio')} value={form.bio} onChangeText={v => setForm(user => ({ ...user, bio: v }))} multiline placeholderTextColor={theme.placeholder} />
      <View style={styles.locationContainer}>
        <View style={styles.cityInputContainerFullWidth}>
          <TextInput
            style={[styles.input, cityInput && styles.inputWithClear, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border, width: '100%' }]}
            placeholder={t('profile.edit.city')}
            value={cityInput}
            onChangeText={handleCityChange}
            onSubmitEditing={handleCitySubmit}
            placeholderTextColor={theme.placeholder}
          />
          {cityInput && (
            <TouchableOpacity 
              style={[styles.clearButton, { backgroundColor: theme.card, position: 'absolute', right: 10, top: 12 }]}
              onPress={() => { setCityInput(''); setFormattedAddress(''); setForm(user => ({ ...user, location: { ...user.location, city: '', formattedAddress: '' } })); }}
            >
              <Text style={[styles.clearButtonText, { color: theme.primary }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.countryButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={[styles.countryButtonText, { color: theme.text }]}>
            {country || t('auth.signUp.selectCountry')}
          </Text>
        </TouchableOpacity>
        {isLoadingLocation && (
          <ActivityIndicator style={styles.locationLoader} color={theme.primary} />
        )}
        {locationError && (
          <Text style={[styles.error, { color: theme.error }]}>{locationError}</Text>
        )}
        {formattedAddress && (
          <Text style={[styles.locationText, { color: theme.primary }]}>{formattedAddress}</Text>
        )}
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{t('profile.edit.interests') || 'Intereses'}</Text>
      <View style={styles.tagsContainer}>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={[styles.tagInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={interestInput}
            onChangeText={setInterestInput}
            onSubmitEditing={() => {
              if (interestInput.trim() && !form.interests.split(',').map(i => i.trim()).includes(interestInput.trim())) {
                setForm(user => ({ ...user, interests: user.interests ? user.interests + ', ' + interestInput.trim() : interestInput.trim() }));
                setInterestInput('');
              }
            }}
            placeholder={t('plans.create.tagPlaceholder')}
            placeholderTextColor={theme.placeholder}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => {
              if (interestInput.trim() && !form.interests.split(',').map(i => i.trim()).includes(interestInput.trim())) {
                setForm(user => ({ ...user, interests: user.interests ? user.interests + ', ' + interestInput.trim() : interestInput.trim() }));
                setInterestInput('');
              }
            }}
          >
            <Text style={{ color: theme.primary, fontSize: 22, fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsList}>
          {form.interests.split(',').map((tag, index) => {
            const trimmed = tag.trim();
            if (!trimmed) return null;
            return (
              <View key={index} style={[styles.tagChip, { backgroundColor: theme.card }]}> 
                <Text style={[styles.tagText, { color: theme.text }]}>{trimmed}</Text>
                <TouchableOpacity onPress={() => {
                  setForm(user => ({ ...user, interests: user.interests.split(',').map(i => i.trim()).filter(i => i && i !== trimmed).join(', ') }));
                }}>
                  <Text style={{ color: theme.primary, fontSize: 18, marginLeft: 4 }}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? t('profile.edit.saving') : t('profile.edit.save')}</Text>
      </TouchableOpacity>
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}> 
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder={t('auth.signUp.searchCountry')}
              onChangeText={filterCountries}
              placeholderTextColor={theme.placeholder}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#E6E0F8' },
  container: { padding: 24, paddingTop: 40 },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#5C4D91', 
    marginBottom: 24,
    textAlign: 'center'
  },
  imageContainer: { alignSelf: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  placeholderImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#5C4D91', fontSize: 16 },
  input: { height: 48, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#D1C4E9' },
  saveButton: { backgroundColor: '#5C4D91', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 16, textAlign: 'center' },
  locationContainer: { marginBottom: 20 },
  cityInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cityInputContainerFullWidth: { width: '100%', position: 'relative', marginBottom: 10 },
  inputWithClear: { paddingRight: 40 },
  clearButton: { padding: 5, borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 10 },
  clearButtonText: { fontSize: 16, fontWeight: 'bold' },
  countryButton: { padding: 10, borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 10 },
  countryButtonText: { fontSize: 16, fontWeight: 'bold' },
  locationLoader: { marginLeft: 10 },
  locationText: { marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 20 },
  searchInput: { padding: 10, marginBottom: 10 },
  countryItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#D1C4E9' },
  countryItemText: { fontSize: 16 },
  closeButton: { padding: 10, alignItems: 'center' },
  closeButtonText: { fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  tagsContainer: { marginBottom: 16 },
  tagInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tagInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginRight: 8 },
  addTagButton: { padding: 8 },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 15, marginRight: 4 },
}); 