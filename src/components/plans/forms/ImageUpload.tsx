import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface ImageUploadProps {
  onPress: () => void;
  hasImage: boolean;
}

export default function ImageUpload({ onPress, hasImage }: ImageUploadProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.card }]} 
      onPress={onPress}
    >
      <Ionicons name="image" size={40} color={theme.primary} />
      <Text style={[styles.text, { color: theme.text }]}>
        {hasImage ? t('plans.create.changeImage') : t('plans.create.addImage')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  text: {
    marginTop: 8,
    fontSize: 16,
  },
}); 