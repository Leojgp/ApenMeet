import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import { useCreatePlanForm } from '../../hooks/useCreatePlanForm';
import ImageUpload from './ImageUpload';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export const CreatePlanForm = () => {
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
    handleCoordinatesChange,
    showTimePicker,
    setShowTimePicker,
    tempDate,
    handleDateChange,
    handleTimeChange
  } = useCreatePlanForm();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(text) => handleChange('title', text)}
          placeholder="Ej: Bolos en el centro con amigos"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="Describe tu plan..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={form.location.address}
          onChangeText={(text) => handleLocationChange(text)}
          placeholder="Ej: Kinepolis, Pulianas, Granada, España"
        />

        <Text style={styles.label}>Coordenadas</Text>
        <View style={styles.coordinatesContainer}>
          <TextInput
            style={[styles.input, styles.coordinateInput]}
            value={form.location.coordinates[0]?.toString()}
            onChangeText={(text) => handleCoordinatesChange(0, parseFloat(text))}
            placeholder="Latitud"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.coordinateInput]}
            value={form.location.coordinates[1]?.toString()}
            onChangeText={(text) => handleCoordinatesChange(1, parseFloat(text))}
            placeholder="Longitud"
            keyboardType="numeric"
          />
        </View>

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

        <Text style={styles.label}>Máximo de Participantes</Text>
        <TextInput
          style={styles.input}
          value={form.maxParticipants?.toString()}
          onChangeText={(text) => handleChange('maxParticipants', parseInt(text))}
          placeholder="Ej: 10"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Etiquetas</Text>
        <TextInput
          style={styles.input}
          value={form.tags.join(', ')}
          onChangeText={handleTagsChange}
          placeholder="Ej: naturaleza, senderismo, deporte"
        />

        <Text style={styles.label}>Imagen</Text>
        <View style={styles.imageContainer}>
          {form.image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePick}>
                <Text style={styles.changeImageText}>Cambiar Imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ImageUpload onPress={handleImagePick} hasImage={false} />
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateInput: {
    flex: 1,
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