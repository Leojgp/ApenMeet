import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createPlan } from '../api/plansApi';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface CreatePlanFormState {
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  tags: string[];
  dateTime: string;
  maxParticipants: number;
  image: string | null;
}

export const useCreatePlanForm = () => {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [form, setForm] = useState<CreatePlanFormState>({
    title: '',
    description: '',
    location: {
      address: '',
      coordinates: [0, 0]
    },
    tags: [],
    dateTime: '',
    maxParticipants: 0,
    image: null
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setForm(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [loc.coords.latitude, loc.coords.longitude]
            }
          }));
        }
      } catch (error) {
      }
    };
    getLocation();
  }, []);

  const handleChange = (field: keyof CreatePlanFormState, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (address: string) => {
    setForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address
      }
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

  const handleTagsChange = (text: string) => {
    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag);
    setForm(prev => ({
      ...prev,
      tags
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
        dateTime: finalDate.toISOString()
      }));
      setTempDate(null);
    }
  };

  const handleDateTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event && event.type === 'set' && selectedDate) {
      setForm(prev => ({
        ...prev,
        dateTime: selectedDate.toISOString()
      }));
    }
    setShowDatePicker(false);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.cancelled) {
      setForm(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.title || !form.description || !form.location.address || !form.dateTime || !form.maxParticipants) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return;
      }
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('location[address]', form.location.address);
      formData.append('location[coordinates][0]', form.location.coordinates[0].toString());
      formData.append('location[coordinates][1]', form.location.coordinates[1].toString());
      formData.append('tags', JSON.stringify(form.tags));
      formData.append('dateTime', form.dateTime);
      formData.append('maxParticipants', form.maxParticipants.toString());
      if (form.image) {
        const imageUri = form.image;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type
        } as any);
      }
      await createPlan(formData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el plan');
    }
  };

  return {
    form,
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
    handleTimeChange
  };
}; 