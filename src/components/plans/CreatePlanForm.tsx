import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { CreatePlanFormState } from '../../hooks/useCreatePlanForm';

interface CreatePlanFormProps {
  formState: CreatePlanFormState;
  updateFormState: (field: keyof CreatePlanFormState, value: any) => void;
  handleCreate: () => void;
  loading: boolean;
  error: string | null;
}

export default function CreatePlanForm({
  formState,
  updateFormState,
  handleCreate,
  loading,
  error
}: CreatePlanFormProps) {
  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder="Title (required)" 
        value={formState.title} 
        onChangeText={(value) => updateFormState('title', value)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Description (required)" 
        value={formState.description} 
        onChangeText={(value) => updateFormState('description', value)} 
        multiline 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Address (required)" 
        value={formState.address} 
        onChangeText={(value) => updateFormState('address', value)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Tags (comma separated, optional)" 
        value={formState.tags} 
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
        value={formState.maxParticipants} 
        onChangeText={(value) => updateFormState('maxParticipants', value)} 
        keyboardType="numeric" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Image URL (optional)" 
        value={formState.imageUrl} 
        onChangeText={(value) => updateFormState('imageUrl', value)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Status (open/cancelled, optional)" 
        value={formState.status} 
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
    padding: 24,
    paddingTop: 40,
    minHeight: '100%',
  },
  input: {
    height: 48,
    backgroundColor: '#F7F5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6E0F8',
  },
  dateButton: {
    backgroundColor: '#E6E0F8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  dateButtonText: {
    color: '#5C4D91',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    color: '#5C4D91',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F7F5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6E0F8',
  },
  timeInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F7F5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6E0F8',
  },
  createButton: {
    backgroundColor: '#5C4D91',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
}); 