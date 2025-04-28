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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5C4D91" />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      );
    }
  
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} navigation={navigation} />
        ))}
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 18,
      paddingTop: 24,
      minHeight: '100%',
      alignItems: 'stretch',
    },
    centered: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    error: {
      color: 'red',
    },
  });