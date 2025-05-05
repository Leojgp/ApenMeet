import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { CreatePlanFormState } from '../../hooks/useCreatePlanForm';
import ImageUpload from './ImageUpload';

interface CreatePlanFormProps {
  formState: CreatePlanFormState;
  updateFormState: (field: keyof CreatePlanFormState, value: any) => void;
  handleCreate: () => void;
  pickImage: () => void;
  loading: boolean;
  error: string | null;
}

export default function CreatePlanForm({
  formState,
  updateFormState,
  handleCreate,
  pickImage,
  loading,
  error
}: CreatePlanFormProps) {
  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder="Title (required)" 
        value={formState.title || ''} 
        onChangeText={(value) => updateFormState('title', value)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Description (required)" 
        value={formState.description || ''} 
        onChangeText={(value) => updateFormState('description', value)} 
        multiline 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Address (required)" 
        value={formState.address || ''} 
        onChangeText={(value) => updateFormState('address', value)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Tags (comma separated, optional)" 
        value={formState.tags || ''} 
        onChangeText={(value) => updateFormState('tags', value)} 
      />
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => updateFormState('showDate', !formState.showDate)}
      >
        <Text style={styles.dateButtonText}>Date: {formState.date.toLocaleString()}</Text>
      </TouchableOpacity>
      {formState.showDate && (
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Select Date and Time</Text>
          <View style={styles.datePicker}>
            <TextInput
              style={styles.dateInput}
              value={formState.date.toLocaleDateString()}
              onFocus={() => updateFormState('showDate', true)}
              placeholder="Select date"
            />
            <TextInput
              style={styles.timeInput}
              value={formState.date.toLocaleTimeString()}
              onFocus={() => updateFormState('showDate', true)}
              placeholder="Select time"
            />
          </View>
        </View>
      )}
      <TextInput 
        style={styles.input} 
        placeholder="Max Participants (required)" 
        value={formState.maxParticipants || ''} 
        onChangeText={(value) => updateFormState('maxParticipants', value)} 
        keyboardType="numeric" 
      />
      {formState.image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: formState.image }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ImageUpload onPress={pickImage} hasImage={false} />
      )}
      <TextInput 
        style={styles.input} 
        placeholder="Status (open/cancelled, optional)" 
        value={formState.status || ''} 
        onChangeText={(value) => updateFormState('status', value)} 
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Plan'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E6E0F8',
  },
  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#5C4D91',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    color: '#5C4D91',
    marginBottom: 8,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  timeInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#5C4D91',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 