import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plan } from '../../entities/Plan';
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';

interface PlanCardProps {
  plan: Plan;
  navigation: any;
}

const DEFAULT_IMAGE_URL = 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg';

export default function PlanCard ({ plan, navigation }:PlanCardProps){
  const handlePress = () => {
    navigation.navigate('PlanDetail', { planId: String(plan.id) });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.cardContainer}>
      <Image 
        source={{ uri: plan.imageUrl || DEFAULT_IMAGE_URL }} 
        style={styles.image} 
        onError={(e) => {
          console.log('Error loading image:', e.nativeEvent.error);
        }}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{plan.title}</Text>
        {plan.admins && plan.admins.length > 0 && (
          <Text style={styles.admins}>Admins: {plan.admins.map(a => a.username).join(', ')}</Text>
        )}
        <Text style={styles.subtitle}>{plan.description}</Text>
        <View style={styles.badgesRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{new Date(plan.dateTime).toLocaleDateString()}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{plan.participants.length} going</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 14,
    borderRadius: 12,
    backgroundColor: '#E6E0F8',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  admins: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E6E0F8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#5C4D91',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

