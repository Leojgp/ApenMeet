import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PlanHeaderProps {
  title: string;
  address: string;
  imageUrl: string;
}

const DEFAULT_IMAGE_URL = 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg';

export default function PlanHeader({ title, address, imageUrl }: PlanHeaderProps) {
  return (
    <View style={styles.header}>
      <Image 
        source={{ uri: imageUrl || DEFAULT_IMAGE_URL }} 
        style={styles.avatar} 
        onError={(e) => {
          console.log('Error loading image:', e.nativeEvent.error);
        }}
      />
      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginRight: 18,
    backgroundColor: '#E6E0F8',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
  },
}); 