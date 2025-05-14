import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateUser } from '../../api/user/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('profile.edit.title')}</Text>
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
      <TextInput style={styles.input} placeholder={t('profile.edit.username')} value={form.username} onChangeText={v => setForm(user => ({ ...user, username: v }))} />
      <TextInput style={styles.input} placeholder={t('profile.edit.email')} value={form.email} onChangeText={v => setForm(user => ({ ...user, email: v }))} />
      <TextInput style={styles.input} placeholder={t('profile.edit.bio')} value={form.bio} onChangeText={v => setForm(user => ({ ...user, bio: v }))} multiline />
      <TextInput style={styles.input} placeholder={t('profile.edit.city')} value={form.location.city} onChangeText={async v => {
        setForm(user => ({ ...user, location: { ...user.location, city: v } }));
        if (v.length > 0) {
          try {
            const results = await Location.geocodeAsync(v);
            if (results.length > 0) {
              const { latitude, longitude } = results[0];
              setForm(user => ({
                ...user,
                location: {
                  ...user.location,
                  coordinates: [longitude, latitude]
                }
              }));
            }
          } catch (e) {}
        }
      }} />
      <TextInput style={styles.input} placeholder={t('profile.edit.interests')} value={form.interests} onChangeText={v => setForm(user => ({ ...user, interests: v }))} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? t('profile.edit.saving') : t('profile.edit.save')}</Text>
      </TouchableOpacity>
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
}); 