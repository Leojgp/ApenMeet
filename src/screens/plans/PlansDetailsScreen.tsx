import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useJoinPlan } from '../../hooks/useJoinPlan';
import { usePlansById } from '../../hooks/usePlansById';

interface PlanDetailProps {
  route: any;
}

export default function PlanDetailScreen({ route }: PlanDetailProps) {
  const { planId } = route.params;
  const { plan, loading, error } = usePlansById(planId);
  const { join} = useJoinPlan();

  const [mapReady, setMapReady] = useState(false);

  const handleJoin = async () => {

    const result = await join(planId);
    if (result) {
        console.log('You joined succesfully to the plan')
    }
}
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

  const latitude = plan.location.coordinates[0];
  const longitude = plan.location.coordinates[1];

  return (
    <View style={styles.containerFull}>
      <View style={styles.infoContainer}>
        <Image source={{ uri: plan.imageUrl }} style={styles.image} />
        <Text style={styles.title}>{plan.title}</Text>
        <Text>{plan.description}</Text>
        <Text>Location: {plan.location.address}</Text>
        <Text>Tags: {plan.tags.join(', ')}</Text>
        <Text>Date: {new Date(plan.dateTime).toLocaleString()}</Text>
        <Text>Max Participants: {plan.maxParticipants}</Text>
        <Text>Participants: {plan.participants.map(p => p.username).join(', ')}</Text>
        <Text>Status: {plan.status}</Text>
        <Button title='Join Plan' onPress={() => handleJoin()}/>
      </View>
      
      {latitude && longitude ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            onMapReady={() => setMapReady(true)}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {mapReady && (
              <Marker
                coordinate={{
                  latitude,
                  longitude,
                }}
                title={plan.title}
                description={plan.location.address}
              />
            )}
          </MapView>
        </View>
      ) : (
        <Text style={styles.locationMissing}>No location coordinates available</Text>
      )}
    </View>
  );
  }

const styles = StyleSheet.create({
  containerFull: {
    flex: 1,
  },
  container: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
  },
  mapContainer: {
    padding: 10,
    height: 300,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  locationMissing: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
  }
});