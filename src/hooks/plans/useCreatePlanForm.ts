import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createPlan } from '../../api';

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
  const [currentTag, setCurrentTag] = useState('');
  const [form, setForm] = useState<CreatePlanFormState>({
    title: '',
    description: '',
    location: {
      address: '',
      coordinates: [0, 0]
    },
    tags: [],
    dateTime: '',
    maxParticipants: 2,
    image: null
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          if (!form.location.address) {
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
                coordinates: [loc.coords.latitude, loc.coords.longitude]
              }
            }));
          }
        } else {
          Alert.alert(
            'Permiso de ubicación',
            'Necesitamos acceso a tu ubicación para crear el plan. Por favor, acepta el permiso cuando se te solicite.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, asegúrate de tener el GPS activado.',
          [{ text: 'OK' }]
        );
      }
    };
    getLocation();
  }, [form.location.address]);

  const handleChange = (field: keyof CreatePlanFormState, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (address: string, coordinates?: [number, number]) => {
    setForm(prev => ({
      ...prev,
      location: {
        address,
        coordinates: coordinates || prev.location.coordinates
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

    if (!result.cancelled && result.assets && result.assets.length > 0) {
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

      if (form.location.coordinates[0] === 0 && form.location.coordinates[1] === 0) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, asegúrate de tener el GPS activado y aceptar los permisos de ubicación.',
          [{ text: 'OK' }]
        );
        return;
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('location[address]', form.location.address);
      
      // Enviamos las coordenadas en el formato que espera MongoDB
      formData.append('location[coordinates][0]', form.location.coordinates[1].toString()); // Longitud
      formData.append('location[coordinates][1]', form.location.coordinates[0].toString()); // Latitud
      
      form.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
      
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

  const handleAddTag = () => {
    if (currentTag.trim()) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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