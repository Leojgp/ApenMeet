import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import PlanHeader from '../../components/plans/headers/PlanHeader';
import PlanInfoCard from '../../components/plans/cards/PlanInfoCard';
import PlanMap from '../../components/plans/maps/PlanMap';
import JoinRequestModal from '../../components/plans/modals/JoinRequestModal';

interface Admin {
  id: string;
  username: string;
}

interface PlanDetailProps {
  route: any;
}

export default function PlanDetailScreen({ route }: PlanDetailProps) {
  const { planId } = route.params;
  const {
    plan,
    loading,
    error,
    mapReady,
    setMapReady,
    showJoinRequest,
    handleJoin,
    handleAcceptJoin,
    handleRejectJoin
  } = usePlanDetails(planId);

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
        content={plan.admins.map((admin: Admin) => admin.username).join(', ')}
      />
      <PlanMap
        latitude={latitude}
        longitude={longitude}
        title={plan.title}
        address={plan.location.address}
        mapReady={mapReady}
        setMapReady={setMapReady}
      />
      <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
        <Text style={styles.joinButtonText}>Join Plan</Text>
      </TouchableOpacity>
      <JoinRequestModal
        visible={showJoinRequest}
        onRequestClose={handleRejectJoin}
        onAccept={handleAcceptJoin}
        onReject={handleRejectJoin}
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
});