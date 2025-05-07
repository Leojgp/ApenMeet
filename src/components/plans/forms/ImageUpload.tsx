import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageUploadProps {
  onPress: () => void;
  hasImage: boolean;
}

export default function ImageUpload({ onPress, hasImage }: ImageUploadProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="image-outline" size={40} color="#5C4D91" />
      </View>
      <Text style={styles.text}>
        {hasImage ? 'Change image' : 'Click to upload image'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1C4E9',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '400',
    color: '#5C4D91',
    fontSize: 16,
  },
}); 