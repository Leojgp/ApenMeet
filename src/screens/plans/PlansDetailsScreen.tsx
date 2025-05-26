import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useJoinPlan } from '../../hooks/plans/useJoinPlan';
import { useUser } from '../../hooks/user/useUser';
import { JoinRequestModal, PlanHeader, PlanInfoCard, PlanMap } from '../../components/plans';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import { leavePlan } from '../../api/plans/plansApi';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../models/navigation';
import SharePlanButton from '../../components/plans/SharePlanButton';
import QRCode from 'react-native-qrcode-svg';
import Svg from 'react-native-svg';

type PlansDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlanDetail'>;
type PlansDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PlanDetail'>;

interface PlansDetailsScreenProps {
  navigation: PlansDetailsScreenNavigationProp;
  route: PlansDetailsScreenRouteProp;
}

export default function PlanDetailScreen({ route, navigation }: PlansDetailsScreenProps) {
  const { planId } = route.params;
  const { plan, loading, error, refetch } = usePlanDetails(planId);
  const { user } = useUser();
  const { join, loadingPlan: joinLoading } = useJoinPlan();
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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

  const handleShare = async () => {
    try {
      const shareLink = `apenmeet://plan/${planId}`;
      const message = `Para abrir el plan, copia y pega este enlace en el navegador de tu móvil:\n\n${shareLink}\n\nSi tienes la app instalada, se abrirá automáticamente.`;
      await Share.share({
        message,
        title: plan?.title,
        url: shareLink
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the plan');
    }
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
              onPress={() => plan._id && navigation.navigate('EditPlan', { planId: plan._id })}
            >
              <Ionicons name="pencil" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.card }]}
              onPress={() => plan._id && navigation.navigate('ManageAdmins', { planId: plan._id })}
            >
              <Ionicons name="people" size={24} color={theme.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
      <PlanInfoCard
        title={t('plans.detail.location')}
        content={plan.location.address}
      />
      <PlanInfoCard
        title={t('plans.detail.date')}
        content={new Date(plan.dateTime).toLocaleString()}
      />
      <PlanInfoCard
        title={t('plans.detail.description')}
        content={plan.description}
      />
      <PlanInfoCard
        title={t('plans.detail.tags')}
        content={plan.tags.join(', ')}
      />
      <PlanInfoCard
        title={t('plans.detail.admins')}
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
      </View>
      <View style={styles.shareButtonContainer}>
        <SharePlanButton onPress={handleShare} />
      </View>
      <TouchableOpacity
        style={[styles.qrButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowQRModal(true)}
      >
        <Ionicons name="qr-code-outline" size={24} color={theme.card} />
        <Text style={[styles.qrButtonText, { color: theme.card }]}>Show QR Code</Text>
      </TouchableOpacity>
      <JoinRequestModal
        visible={showJoinRequest}
        onRequestClose={() => setShowJoinRequest(false)}
        onAccept={handleJoin}
        onReject={() => setShowJoinRequest(false)}
      />
      {showQRModal && (
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <QRCode
                value={`apenmeet://plan/${planId}`}
                size={200}
                backgroundColor={theme.card}
                color={theme.text}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQRModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  shareButtonContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  section: {
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 12,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
  },
});