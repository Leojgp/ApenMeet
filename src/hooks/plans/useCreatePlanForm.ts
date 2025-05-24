import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createPlan, editPlan } from '../../api/plans/plansApi';

export interface CreatePlanFormState {
  title: string;
  description: string;
  dateTime: Date;
  location: {
    address: string;
    coordinates: [number, number];
  };
  tags: string[];
  image: ImagePicker.ImagePickerResult['assets'][0] | null;
  imageUrl?: string;
  maxParticipants?: number;
}

export const useCreatePlanForm = (isEditing: boolean = false) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [form, setForm] = useState<CreatePlanFormState>({
    title: '',
    description: '',
    dateTime: new Date(),
    location: {
      address: '',
      coordinates: [0, 0],
    },
    tags: [],
    image: null,
    maxParticipants: 10,
  });

  useEffect(() => {
    const getLocation = async () => {
      if (isEditing || initialLocationSet) return;
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          const [address] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });

          const formattedAddress = address ? 
            `${address.street}, ${address.city}, ${address.region}, ${address.country}` :
            `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`;

          setForm(prev => ({
            ...prev,
            location: {
              address: formattedAddress,
              coordinates: [loc.coords.longitude, loc.coords.latitude]
            }
          }));
          setInitialLocationSet(true);
        } else {
          Alert.alert(
            t('location.permission.title'),
            t('location.permission.message'),
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        Alert.alert(
          t('alerts.errors.location'),
          t('api.errors.general.serverError'),
          [{ text: 'OK' }]
        );
      }
    };
    getLocation();
  }, [initialLocationSet, isEditing, t]);

  const handleChange = (field: keyof CreatePlanFormState, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (location: { address: string; coordinates: [number, number] }) => {
    setInitialLocationSet(true);
    setForm(prev => ({
      ...prev,
      location,
    }));
  };

  const handleCoordinatesChange = (index: number, value: number) => {
    setForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [
          index === 0 ? value : prev.location.coordinates[0],
          index === 1 ? value : prev.location.coordinates[1]
        ]
      }
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setForm(prev => ({
      ...prev,
      tags,
    }));
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime && tempDate) {
      const finalDate = new Date(tempDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      setForm(prev => ({
        ...prev,
        dateTime: finalDate,
      }));
      setTempDate(null);
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm(prev => ({
        ...prev,
        dateTime: selectedDate,
      }));
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setForm(prev => ({
          ...prev,
          image: result.assets[0],
        }));
      }
    } catch (error) {
      Alert.alert('Error', t('alerts.errors.image'));
    }
  };

  const handleCreate = async (planId?: string) => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('dateTime', form.dateTime.toISOString());
      formData.append('location[address]', form.location.address || '');
      formData.append('location[coordinates][]', String(form.location.coordinates[0]));
      formData.append('location[coordinates][]', String(form.location.coordinates[1]));
      
      const addressParts = form.location.address.split(',').map(part => part.trim());
      if (addressParts.length > 0) {
        if (addressParts.length === 1) {
          formData.append('location[city]', addressParts[0]);
        } else {
          const country = addressParts[addressParts.length - 1];
          const city = addressParts[addressParts.length - 2];
          if (city) formData.append('location[city]', city);
          if (country) formData.append('location[country]', country);
        }
      }
      
      form.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });

      if (form.maxParticipants) {
        formData.append('maxParticipants', form.maxParticipants.toString());
      }

      if (form.image) {
        const imageUri = form.image.uri;
        const imageName = imageUri.split('/').pop();
        const imageType = `image/${imageUri.split('.').pop()}`;

        formData.append('image', {
          uri: imageUri,
          name: imageName,
          type: imageType,
        } as any);
      }

      console.log('Enviando datos:', {
        title: form.title,
        description: form.description,
        dateTime: form.dateTime.toISOString(),
        location: form.location,
        tags: form.tags,
        maxParticipants: form.maxParticipants
      });

      if (planId) {
        await editPlan(planId, formData);
      } else {
        await createPlan(formData);
      }
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('api.errors.general.serverError');
      Alert.alert('Error', errorMessage);
      throw error;
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputChange = (text: string) => {
    setCurrentTag(text);
  };

  const handleTagInputSubmit = () => {
    handleAddTag();
  };

  const handleParticipantsChange = (value: number) => {
    if (value >= 2 && value <= 100) {
      setForm(prev => ({
        ...prev,
        maxParticipants: value
      }));
    }
  };

  return {
    form,
    setForm,
    handleChange,
    handleCreate,
    handleImagePick,
    handleDateTimeChange,
    showDatePicker,
    setShowDatePicker,
    handleTagsChange,
    handleLocationChange,
    handleCoordinatesChange,
    showTimePicker,
    setShowTimePicker,
    tempDate,
    setTempDate,
    handleDateChange,
    handleTimeChange,
    currentTag,
    handleTagInputChange,
    handleTagInputSubmit,
    handleAddTag,
    handleRemoveTag,
    handleParticipantsChange
  };
};