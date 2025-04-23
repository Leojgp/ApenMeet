import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import PlanCard from '../components/plans/PlanCard';
import { usePlans } from '../hooks/usePlans';

interface PlansScreenProps{
    navigation: any;
}

export default function PlansScreen({navigation}:PlansScreenProps) {
    const { plans, loading, error } = usePlans();

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.error}>{error}</Text>
        </View>
      );
    }
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} navigation={navigation} />
        ))}
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      padding: 10,
    },
    error: {
      color: 'red',
    },
  });