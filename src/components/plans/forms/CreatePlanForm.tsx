import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import { useCreatePlanForm } from '../../../hooks/plans/useCreatePlanForm';
import ImageUpload from './ImageUpload';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import LocationPicker from '../maps/LocationPicker';

interface CreatePlanFormProps {
  onSubmit?: (form: any) => Promise<void>;
  initialValues?: any;
  isEditing?: boolean;
}

export default function CreatePlanForm({ onSubmit, initialValues, isEditing = false }: CreatePlanFormProps) {
  const {
    form,
    handleChange,
    handleCreate,
    handleImagePick,
    handleDateTimeChange,
    showDatePicker,
    setShowDatePicker,
    handleTagsChange,
    handleLocationChange,
    showTimePicker,
    setShowTimePicker,
    tempDate,
    handleDateChange,
    handleTimeChange,
    setForm,
    handleTagInputChange,
    handleTagInputSubmit,
    handleAddTag,
    handleRemoveTag,
    currentTag,
  } = useCreatePlanForm(isEditing);

  useEffect(() => {
    if (initialValues) {
      console.log('Setting initial values:', initialValues);
      setForm(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(form);
    } else {
      await handleCreate();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(text) => {
            console.log('Title changed:', text);
            handleChange('title', text);
          }}
          placeholder="Título del plan"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(text) => {
            console.log('Description changed:', text);
            handleChange('description', text);
          }}
          placeholder="Descripción del plan"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Fecha y Hora</Text>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {form.dateTime ? new Date(form.dateTime).toLocaleString() : 'Seleccionar fecha y hora'}
          </Text>
          <Ionicons name="calendar" size={24} color="#5C4D91" />
        </TouchableOpacity>

        {Platform.OS === 'ios' && showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={form.dateTime ? new Date(form.dateTime) : new Date()}
            mode="datetime"
            display="spinner"
            onChange={handleDateTimeChange}
            minimumDate={new Date()}
          />
        )}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={form.dateTime ? new Date(form.dateTime) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={form.dateTime ? new Date(form.dateTime) : new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Text style={styles.label}>Ubicación</Text>
        <LocationPicker
          onLocationSelect={(location) => {
            console.log('Location changed:', location);
            handleLocationChange(location);
          }}
          initialLocation={form.location}
        />

        <Text style={styles.label}>Etiquetas</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={currentTag}
              onChangeText={handleTagInputChange}
              onSubmitEditing={handleTagInputSubmit}
              placeholder="Añadir etiqueta..."
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={handleAddTag}
            >
              <Ionicons name="add-circle" size={24} color="#5C4D91" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {form.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                  <Ionicons name="close-circle" size={20} color="#5C4D91" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Imagen</Text>
        <View style={styles.imageContainer}>
          {form.image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.image.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePick}>
                <Text style={styles.changeImageText}>Cambiar Imagen</Text>
              </TouchableOpacity>
            </View>
          ) : form.imageUrl ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePick}>
                <Text style={styles.changeImageText}>Cambiar Imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ImageUpload onPress={handleImagePick} hasImage={false} />
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{onSubmit ? 'Guardar Cambios' : 'Crear Plan'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  participantButton: {
    padding: 8,
  },
  participantCount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#5C4D91',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});