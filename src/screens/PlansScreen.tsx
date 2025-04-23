import React from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { usePlans } from '../hooks/usePlans';

const PlansScreen = () => {
  const { plans, loading, error } = usePlans();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView contentContainerStyle={styles.container}>
      {plans.map((plan) => (
        <View key={plan.id} style={styles.planContainer}>
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
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default PlansScreen;
