import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plan } from '../../entities/Plan';
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';

interface PlanCardProps {
  plan: Plan;
  navigation: any;
}


export default function PlanCard ({ plan, navigation }:PlanCardProps){

  const handlePress = () => {
    navigation.navigate('PlanDetail', { planId: String(plan.id) });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.cardContainer}>
      <Image source={{ uri: plan.imageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text>{plan.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

