import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateUser } from '../../api/user/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import * as Location from 'expo-location';

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    bio: '',
    location: { city: '', coordinates: [0, 0] },
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
        console.log('User data received:', data.user); 
        const profileImage = data.user.profileImage || 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746874674/default_Profile_Image_oiw2nt.webp';
        console.log('Setting profile image to:', profileImage);
        
        setForm({
          id: data.user._id || data.user.id || '',
          username: data.user.username || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          location: data.user.location || { city: '', coordinates: [0, 0] },
          interests: Array.isArray(data.user.interests) ? data.user.interests.join(', ') : (data.user.interests || ''),
          profileImage: profileImage,
        });
        dispatch(setUser({
          id: data.user._id || data.user.id || '',
          username: data.user.username || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          location: data.user.location || { city: '', coordinates: [0, 0] },
          interests: Array.isArray(data.user.interests) ? data.user.interests : [],
          profileImage: profileImage,
        }));
      })
      .catch((err) => {
        console.error('Error loading user data:', err);
        setError('Error loading user data');
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required');
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
      console.log('Coordenadas antes de guardar:', form.location.coordinates, 'Ciudad:', form.location.city);
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('bio', form.bio);
      formData.append('location[city]', form.location.city);
      formData.append('location[coordinates][]', String(form.location.coordinates[0]));
      formData.append('location[coordinates][]', String(form.location.coordinates[1]));
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
      console.log('Update response:', response); 

      dispatch(setUser({
        id: form.id,
        username: form.username,
        email: form.email,
        bio: form.bio,
        location: { city: form.location.city, coordinates: [form.location.coordinates[0], form.location.coordinates[1]] as [number, number] },
        interests: form.interests.split(',').map(i => i.trim()),
        profileImage: response.user.profileImage || form.profileImage,
      }));
      navigation.goBack();
    } catch (e: any) {
      console.error('Error saving profile:', e);
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
      <Text style={styles.title}>Edit Profile</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {form.profileImage ? (
          <Image 
            source={{ uri: form.profileImage }} 
            style={styles.profileImage}
            onError={(e) => {
              console.log('Error loading image:', e.nativeEvent.error);
              console.log('Image URL:', form.profileImage);
              setForm(prev => ({
                ...prev,
                profileImage: 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746636109/apenmeet/dljiilozwzcmyinqaaeo.jpg'
              }));
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <TextInput style={styles.input} placeholder="Username" value={form.username} onChangeText={v => setForm(user => ({ ...user, username: v }))} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={v => setForm(user => ({ ...user, email: v }))} />
      <TextInput style={styles.input} placeholder="Bio" value={form.bio} onChangeText={v => setForm(user => ({ ...user, bio: v }))} multiline />
      <TextInput style={styles.input} placeholder="City" value={form.location.city} onChangeText={async v => {
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
      <TextInput style={styles.input} placeholder="Interests (comma separated)" value={form.interests} onChangeText={v => setForm(user => ({ ...user, interests: v }))} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
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