import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PlanHeaderProps {
  title: string;
  address: string;
  imageUrl: string;
}

export default function PlanHeader({ title, address, imageUrl }: PlanHeaderProps) {
  return (
    <View style={styles.header}>
      <Image source={{ uri: imageUrl }} style={styles.avatar} />
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