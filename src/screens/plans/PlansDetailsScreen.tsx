import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useJoinPlan } from '../../hooks/plans/useJoinPlan';

import { useUser } from '../../hooks/user/useUser';
import { JoinRequestModal, PlanHeader, PlanInfoCard, PlanMap } from '../../components/plans';

interface PlanDetailProps {
  route: {
    params: {
      planId: string;
    };
  };
  navigation: any;
}

export default function PlanDetailScreen({ route, navigation }: PlanDetailProps) {
  const { planId } = route.params;
  const { plan, loading, error } = usePlanDetails(planId);
  const { user } = useUser();
  const { join, loadingPlan: joinLoading } = useJoinPlan();
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const handleJoin = async () => {
    try {
      await join(planId);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error joining plan:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Plan not found'}</Text>
      </View>
    );
  }

  const latitude = plan.location.coordinates[0];
  const longitude = plan.location.coordinates[1];

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scrollContent}>
      {showSuccess && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>¡Te has unido al plan correctamente!</Text>
        </View>
      )}
      <PlanHeader
        title={plan.title}
        address={plan.location.address}
        imageUrl={plan.imageUrl}
      />
      <PlanInfoCard
        title="Description"
        content={plan.description}
        badges={{
          dateTime: new Date(plan.dateTime).toLocaleString(),
          participantsCount: plan.participants.length,
          status: plan.status
        }}
      />
      <PlanInfoCard
        title="Tags"
        content={plan.tags.join(', ')}
      />
      <PlanInfoCard
        title="Admins"
        content={plan.admins.map((admin: any) => admin.username).join(', ')}
      />
      <PlanMap
        latitude={latitude}
        longitude={longitude}
        title={plan.title}
        address={plan.location.address}
        mapReady={mapReady}
        setMapReady={setMapReady}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.chatButton]} 
          onPress={() => navigation.navigate('Chat', { planId, planTitle: plan.title })}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.joinButton]} 
          onPress={handleJoin}
          disabled={joinLoading}
        >
          <Text style={styles.buttonText}>{joinLoading ? 'Joining...' : 'Join Plan'}</Text>
        </TouchableOpacity>
      </View>
      <JoinRequestModal
        visible={showJoinRequest}
        onRequestClose={() => setShowJoinRequest(false)}
        onAccept={handleJoin}
        onReject={() => setShowJoinRequest(false)}
      />
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
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#4CAF50',
  },
  joinButton: {
    backgroundColor: '#5C4D91',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});