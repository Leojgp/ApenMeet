import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
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

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text>Plan not found</Text>
      </View>
    );
  }

  const latitude = plan.location.coordinates[0];
  const longitude = plan.location.coordinates[1];

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Image source={{ uri: plan.imageUrl }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.subtitle}>{plan.location.address}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{plan.description}</Text>
        <View style={styles.badgesRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{new Date(plan.dateTime).toLocaleString()}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{plan.participants.length} going</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{plan.status}</Text></View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <Text style={styles.sectionText}>{plan.tags.join(', ')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Admins</Text>
        <Text style={styles.sectionText}>{plan.admins.map(a => a.username).join(', ')}</Text>
      </View>
      <View style={styles.mapCard}>
        {latitude && longitude ? (
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
                coordinate={{ latitude, longitude }}
                title={plan.title}
                description={plan.location.address}
              />
            )}
          </MapView>
        ) : (
          <Text style={styles.locationMissing}>No location coordinates available</Text>
        )}
      </View>
      <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
        <Text style={styles.joinButtonText}>Join Plan</Text>
      </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  card: {
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#5C4D91',
    fontSize: 16,
    marginBottom: 6,
  },
  sectionText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 4,
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
  mapCard: {
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 18,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  locationMissing: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
  },
  joinButton: {
    backgroundColor: '#5C4D91',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});