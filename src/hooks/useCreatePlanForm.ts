import { useState } from 'react';
import { useCreatePlan } from './useCreatePlan';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export interface CreatePlanFormState {
  title: string;
  description: string;
  address: string;
  tags: string;
  date: Date;
  showDate: boolean;
  maxParticipants: string;
  image: string | null;
  status: string;
}

export const useCreatePlanForm = () => {
  const navigation = useNavigation();
  const { create, loading, error } = useCreatePlan();
  
  const [formState, setFormState] = useState<CreatePlanFormState>({
    title: '',
    description: '',
    address: '',
    tags: '',
    date: new Date(),
    showDate: false,
    maxParticipants: '',
    image: null,
    status: 'open'
  });

  const updateFormState = (field: keyof CreatePlanFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (result.cancelled) {
        return;
      }
      if (!result.assets || result.assets.length === 0) {
        alert('No se pudo seleccionar la imagen');
        return;
      }

      setFormState(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error al seleccionar la imagen. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append('title', formState.title);
    formData.append('description', formState.description);
    formData.append('location', JSON.stringify({ 
      address: formState.address, 
      coordinates: [0, 0] 
    }));
    formData.append('tags', JSON.stringify(formState.tags.split(',').map(t => t.trim()).filter(Boolean)));
    formData.append('dateTime', formState.date.toISOString());
    formData.append('maxParticipants', formState.maxParticipants);
    formData.append('status', formState.status);

    if (formState.image) {
      const uriParts = formState.image.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('image', {
        uri: formState.image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    const ok = await create(formData);
    if (ok) navigation.goBack();
  };

  return {
    formState,
    updateFormState,
    handleCreate,
    pickImage,
    loading,
    error
  };
}; 