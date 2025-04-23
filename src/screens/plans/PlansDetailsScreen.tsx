// PlanDetailScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { usePlans } from '../../hooks/usePlans';

interface PlanDetailProps {
    route: any;
  }

export default function PlanDetailScreen({ route }: PlanDetailProps){
    const { planId } = route.params;
  const { plans, loading, error } = usePlans();

  const plan = plans.find(p => p.id === planId);

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

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text>Plan not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: plan.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{plan.title}</Text>
      <Text>{plan.description}</Text>
      <Text>Location: {plan.location.address}</Text>
      <Text>Tags: {plan.tags.join(', ')}</Text>
      <Text>Date: {new Date(plan.dateTime).toLocaleString()}</Text>
      <Text>Max Participants: {plan.maxParticipants}</Text>
      <Text>Participants: {plan.participants.map(p => p.username).join(', ')}</Text>
      <Text>Status: {plan.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
  },
});

