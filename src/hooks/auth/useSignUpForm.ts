import { useState } from 'react';
import { useAuth } from './useAuth';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

export interface SignUpFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
    formattedAddress: string;
    postalCode?: string;
    region?: string;
    timezone?: string;
  };
  interests: string;
  profileImage: string | null;
}

export const useSignUpForm = (navigation?: any) => {
  const { handleRegister, loading, error } = useAuth({ navigation });
  const { t } = useTranslation();

  const [formState, setFormState] = useState<SignUpFormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: {
      city: '',
      country: '',
      coordinates: [0, 0],
      formattedAddress: '',
    },
    interests: '',
    profileImage: null
  });

  const updateFormState = (field: keyof SignUpFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

    if (!result.cancelled) {
      setFormState(prev => ({
        ...prev,
        profileImage: result.assets[0].uri
      }));
    }
  };

  const handleSubmit = async (userData: any) => {
    await handleRegister(userData);
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
    pickImage,
    loading,
    error
  };
}; 