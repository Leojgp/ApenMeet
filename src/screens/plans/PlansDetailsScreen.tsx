import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions, Button, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useJoinPlan } from '../../hooks/useJoinPlan';
import { usePlansById } from '../../hooks/usePlansById';
import { getCurrentUser } from '../../api/userApi';

interface PlanDetailProps {
  route: any;
}

export default function PlanDetailScreen({ route }: PlanDetailProps) {
  const { planId } = route.params;
  const { plan, loading, error } = usePlansById(planId);
  const { join } = useJoinPlan();
  const [mapReady, setMapReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (plan && user) {
          setIsAdmin(plan.admins.some(a => a._id === user._id));
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, [plan]);

  const handleJoin = async () => {
    if (isAdmin) {
      setShowJoinRequest(true);
    } else {
      const result = await join(planId);
      if (result) {
        console.log('You joined successfully to the plan');
      }
    }
  };

  const handleAcceptJoin = async () => {
    const result = await join(planId);
    if (result) {
      console.log('User joined successfully to the plan');
      setShowJoinRequest(false);
    }
  };

  const handleRejectJoin = () => {
    setShowJoinRequest(false);
  };

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
        <Text>Admins: {plan.admins.map(a => a.username).join(', ')}</Text>
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

      <Modal
        visible={showJoinRequest}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowJoinRequest(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Request</Text>
            <Text style={styles.modalText}>A user wants to join your plan. Do you want to accept?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.acceptButton]} onPress={handleAcceptJoin}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.rejectButton]} onPress={handleRejectJoin}>
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});