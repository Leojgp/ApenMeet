import { useState } from 'react';
import { useAuth } from './useAuth';
import * as ImagePicker from 'expo-image-picker';

export interface SignUpFormState {
  username: string;
  email: string;
  password: string;
  bio: string;
  location: {
    city: string;
    coordinates: [number, number];
  };
  interests: string;
  profileImage: string | null;
}

export const useSignUpForm = (navigation?: any) => {
  const { handleRegister, loading, error } = useAuth({ navigation });

  const [formState, setFormState] = useState<SignUpFormState>({
    username: '',
    email: '',
    password: '',
    bio: '',
    location: {
      city: '',
      coordinates: [0, 0]
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
      alert('Sorry, we need camera roll permissions to make this work!');
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

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('username', formState.username);
    formData.append('email', formState.email);
    formData.append('password', formState.password);
    formData.append('bio', formState.bio);
    formData.append('location', JSON.stringify(formState.location));
    formData.append('interests', formState.interests);

    if (formState.profileImage) {
      const uriParts = formState.profileImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('profileImage', {
        uri: formState.profileImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    await handleRegister(formData);
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