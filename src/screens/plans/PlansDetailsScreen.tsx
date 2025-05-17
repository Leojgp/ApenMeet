import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useJoinPlan } from '../../hooks/plans/useJoinPlan';
import { useUser } from '../../hooks/user/useUser';
import { JoinRequestModal, PlanHeader, PlanInfoCard, PlanMap } from '../../components/plans';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import { leavePlan } from '../../api/plans/plansApi';

export default function PlanDetailScreen({ route, navigation }: any) {
  const { planId } = route.params;
  const { plan, loading, error, refetch } = usePlanDetails(planId);
  const { user } = useUser();
  const { join, loadingPlan: joinLoading } = useJoinPlan();
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isAdmin = plan?.admins?.some((admin: any) => admin._id === user?._id);
  const isCreator = plan?.creatorId === user?._id;
  const isParticipant = plan?.participants?.some(
    (p: any) => {
      const participantId = p.id?._id || p._id;
      return participantId === user?._id;
    }
  );

  const handleJoin = async () => {
    try {
      const result = await join(planId);
      if (result) {
        setShowSuccess(true);
        await refetch(); 
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error joining plan:', error);
    }
  };

  const handleLeavePlan = async () => {
    Alert.alert(
      t('plans.leaveTitle') || 'Abandonar plan',
      t('plans.leaveConfirm') || '¿Seguro que quieres abandonar este plan?',
      [
        { text: t('alerts.deletePlan.cancel'), style: 'cancel' },
        {
          text: t('plans.leave') || 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            try {
              await leavePlan(planId, user?._id);
              await refetch(); 
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'Error');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}> 
        <Text style={{ color: theme.text }}>{t('plans.detail.loading')}</Text>
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}> 
        <Text style={[styles.error, { color: theme.error }]}>{error || t('plans.detail.notFound')}</Text>
      </View>
    );
  }

  const latitude = plan.location.coordinates[1];
  const longitude = plan.location.coordinates[0];

  return (
    <ScrollView style={[styles.bg, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      {showSuccess && (
        <View style={[styles.successMessage, { backgroundColor: theme.primary }]}> 
          <Text style={[styles.successText, { color: theme.card }]}>
          {t('api.success.joined')}
          </Text>
        </View>
      )}
      <View style={styles.headerContainer}>
        <PlanHeader
          title={plan.title}
          address={plan.location.address}
          imageUrl={plan.imageUrl || 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746874867/noImagePlan_rfm46c.webp'}
        />
        {isAdmin && (
          <>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('EditPlan', { planId: plan._id })}
            >
              <Ionicons name="pencil" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('ManageAdmins', { planId: plan._id })}
            >
              <Ionicons name="people" size={24} color={theme.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
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
      <TouchableOpacity 
        style={[styles.button, styles.chatButton, { backgroundColor: theme.success }]}
        onPress={() => navigation.navigate('Chat', { planId, planTitle: plan.title })}
      >
        <Ionicons name="chatbubble-outline" size={24} color={theme.card} />
        <Text style={[styles.buttonText, { color: theme.card }]}>{t('plans.detail.chat')}</Text>
      </TouchableOpacity>
      {!isParticipant && (
        <TouchableOpacity 
          style={[styles.button, styles.joinButton, { backgroundColor: theme.primary }]}
          onPress={handleJoin}
          disabled={joinLoading}
        >
          <Text style={[styles.buttonText, { color: theme.card }]}>
            {joinLoading ? t('plans.detail.joining', 'Joining...') : t('plans.detail.join')}
          </Text>
        </TouchableOpacity>
      )}
      {isParticipant && !isCreator && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.error }]}
          onPress={handleLeavePlan}
        >
          <Text style={[styles.buttonText, { color: theme.card }]}>{t('plans.leave')}</Text>
        </TouchableOpacity>
      )}
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
    // backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginBottom: 10,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
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
    marginTop: 12,
  },
  chatButton: {},
  joinButton: {},
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessage: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});