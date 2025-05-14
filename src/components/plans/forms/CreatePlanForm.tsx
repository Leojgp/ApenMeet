import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import { useCreatePlanForm } from '../../../hooks/plans/useCreatePlanForm';
import ImageUpload from './ImageUpload';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import LocationPicker from '../maps/LocationPicker';
import { useTheme } from '../../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface CreatePlanFormProps {
  onSubmit?: (form: any) => Promise<void>;
  initialValues?: any;
  isEditing?: boolean;
}

export default function CreatePlanForm({ onSubmit, initialValues, isEditing = false }: CreatePlanFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();
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
    handleParticipantsChange,
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>{t('plans.create.title')}</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={form.title}
          onChangeText={(text) => {
            console.log('Title changed:', text);
            handleChange('title', text);
          }}
          placeholder={t('plans.create.titlePlaceholder')}
          placeholderTextColor={theme.placeholder}
        />

        <Text style={[styles.label, { color: theme.text }]}>{t('plans.create.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={form.description}
          onChangeText={(text) => {
            console.log('Description changed:', text);
            handleChange('description', text);
          }}
          placeholder={t('plans.create.descriptionPlaceholder')}
          placeholderTextColor={theme.placeholder}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { color: theme.text }]}>{t('plans.create.dateTime')}</Text>
        <TouchableOpacity 
          style={[styles.dateButton, { 
            backgroundColor: theme.card,
            borderColor: theme.border
          }]} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateButtonText, { color: theme.text }]}>
            {form.dateTime ? new Date(form.dateTime).toLocaleString() : t('plans.create.dateTimePlaceholder')}
          </Text>
          <Ionicons name="calendar" size={24} color={theme.primary} />
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

        <Text style={[styles.label, { color: theme.text }]}>Ubicación</Text>
        <LocationPicker
          onLocationSelect={(location) => {
            console.log('Location changed:', location);
            handleLocationChange(location);
          }}
          initialLocation={form.location}
        />

        <Text style={[styles.label, { color: theme.text }]}>Máximo de Participantes</Text>
        <View style={styles.participantsContainer}>
          <TouchableOpacity 
            style={styles.participantButton}
            onPress={() => handleParticipantsChange((form.maxParticipants ?? 10) - 1)}
            disabled={(form.maxParticipants ?? 10) <= 2}
          >
            <Ionicons name="remove-circle" size={24} color={(form.maxParticipants ?? 10) <= 2 ? theme.border : theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.participantCount, { color: theme.text }]}>{form.maxParticipants ?? 10}</Text>
          <TouchableOpacity 
            style={styles.participantButton}
            onPress={() => handleParticipantsChange((form.maxParticipants ?? 10) + 1)}
            disabled={(form.maxParticipants ?? 10) >= 100}
          >
            <Ionicons name="add-circle" size={24} color={(form.maxParticipants ?? 10) >= 100 ? theme.border : theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>{t('plans.create.tags')}</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { 
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border
              }]}
              value={currentTag}
              onChangeText={handleTagInputChange}
              onSubmitEditing={handleTagInputSubmit}
              placeholder={t('plans.create.tagPlaceholder')}
              placeholderTextColor={theme.placeholder}
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={handleAddTag}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {form.tags.map((tag, index) => (
              <View key={index} style={[styles.tagChip, { backgroundColor: theme.card }]}>
                <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                  <Ionicons name="close-circle" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>{t('plans.create.image')}</Text>
        <View style={styles.imageContainer}>
          {form.image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.image.uri }} style={styles.previewImage} />
              <TouchableOpacity style={[styles.changeImageButton, { backgroundColor: theme.primary }]} onPress={handleImagePick}>
                <Text style={[styles.changeImageText, { color: theme.card }]}>{t('plans.create.changeImage')}</Text>
              </TouchableOpacity>
            </View>
          ) : form.imageUrl ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
              <TouchableOpacity style={[styles.changeImageButton, { backgroundColor: theme.primary }]} onPress={handleImagePick}>
                <Text style={[styles.changeImageText, { color: theme.card }]}>{t('plans.create.changeImage')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ImageUpload onPress={handleImagePick} hasImage={false} />
          )}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
          <Text style={[styles.buttonText, { color: theme.card }]}>
            {isEditing ? t('plans.edit.save') : t('plans.create.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
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
    padding: 8,
    borderRadius: 4,
  },
  changeImageText: {
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});