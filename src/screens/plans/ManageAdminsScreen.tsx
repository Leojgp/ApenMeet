import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useUser } from '../../hooks/user/useUser';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { addAdmin, leavePlan, removeAdmin, removeParticipant } from '../../api/plans';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../models/navigation';

type ManageAdminsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManageAdmins'>;

type Participant = {
  id: string;
  _id?: string;
  username: string;
  profileImage?: string;
};

export default function ManageAdminsScreen({ route }: any) {
  const { planId } = route.params;
  const { plan, loading, refetch } = usePlanDetails(planId);
  const { user } = useUser();
  const theme = useTheme();
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigation = useNavigation<ManageAdminsScreenNavigationProp>();

  console.log('PLAN:', plan);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: theme.error }}>{t('plans.detail.notFound')}</Text>
      </View>
    );
  }

  if (!plan.participants || plan.participants.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: theme.text }}>{t('plans.noParticipants')}</Text>
      </View>
    );
  }

  const getUserId = (id: any) => {
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id !== null && id._id) return id._id;
    return '';
  };

  const isAdmin = (participantUserId: string) => {
    return plan.admins.some((admin: any) => getUserId(admin.id) === participantUserId);
  };

  const handleToggleAdmin = async (participantUserId: string) => {
    setLoadingId(participantUserId);
    try {
      const planIdToUse = plan.id || plan._id;
      if (!planIdToUse) {
        throw new Error('Invalid plan ID');
      }
      const participant = plan.participants.find(p => getUserId(p.id) === participantUserId);
      if (!participant) {
        throw new Error('Participant not found');
      }
      const userId = typeof participant.id === 'object' && participant.id !== null
        ? String((participant.id as { _id?: string; id?: string })._id || (participant.id as { id?: string }).id)
        : String(participant.id);
      console.log('Intentando añadir admin con userId:', userId);
      if (isAdmin(userId)) {
        await removeAdmin(planIdToUse, userId);
      } else {
        await addAdmin(planIdToUse, userId);
      }
      await refetch();
    } catch (e: any) {
      console.error('Error:', e);
      Alert.alert('Error', e?.response?.data?.error || 'Error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    Alert.alert(
      t('adminManagement.confirmRemoveTitle') || 'Eliminar usuario',
      t('adminManagement.confirmRemoveMsg') || '¿Seguro que quieres eliminar a este usuario del plan?',
      [
        { text: t('adminManagement.cancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('adminManagement.remove') || 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const planIdToUse = plan.id || plan._id;
              await removeParticipant(planIdToUse!, userId); 
              await refetch();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'Error');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = (userId: string, username: string) => {
    if (getUserId(user._id) === userId) {
      navigation.navigate('Profile', { userId: getUserId(user._id), username: user.username });
    } else {
      const participant = plan.participants.find(p => getUserId(p.id) === userId);
      if (participant) {
        const participantId = typeof participant.id === 'object' && participant.id !== null
          ? String((participant.id as { _id?: string; id?: string })._id || (participant.id as { id?: string }).id)
          : String(participant.id);
        console.log('Navigating to profile with userId:', participantId);
        navigation.navigate('Profile', { userId: participantId, username });
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.primary }]}>{t('adminManagement.title')}</Text>
      <FlatList
        data={plan.participants}
        keyExtractor={item => String(item._id)}
        renderItem={({ item }: { item: Participant }) => {
          console.log('Participant item in renderItem:', item);
          const participantUserId = getUserId(item.id);
          const participantIsAdmin = isAdmin(participantUserId);
          const currentUserIsAdmin = plan.admins.some((admin: any) => getUserId(admin.id) === getUserId(user._id));
          const isCreator = getUserId(user._id) === getUserId(plan.creatorId);
          const isSelf = getUserId(user._id) === participantUserId;

          const renderRightActions = () => (
            <RectButton
              style={{
                backgroundColor: theme.error,
                justifyContent: 'center',
                alignItems: 'center',
                width: 100,
                height: '88%',
                borderRadius: 14,
                marginVertical: 6,
                marginRight: 8
              }}
              onPress={() => handleRemoveUser(participantUserId)}
            >
              <Ionicons name="trash" size={22} color={theme.card} />
              <Text style={{ color: theme.card, fontWeight: 'bold', marginTop: 4, fontSize: 13 }}>
                {t('adminManagement.removeUser') || 'Eliminar'}
              </Text>
            </RectButton>
          );

          return (
            <Swipeable
              renderRightActions={(currentUserIsAdmin || isCreator) && !participantIsAdmin ? renderRightActions : undefined}
              overshootRight={false}
            >
              <TouchableOpacity 
                style={[styles.row, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
                onPress={() => handleViewProfile(participantUserId, item.username)}
              > 
                <View style={styles.userInfo}>
                  {item.profileImage && item.profileImage !== "https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746636109/apenmeet/dljiilozwzcmyinqaaeo.jpg" ? (
                    <Image 
                      source={{ uri: item.profileImage }}
                      style={styles.profileImage} 
                    />
                  ) : null}
                  <Text style={[styles.username, { color: theme.text }]}>
                    {item.username}{isSelf ? ' (' + (t('adminManagement.you') || 'Tú') + ')' : ''}
                  </Text>
                </View>
                {(currentUserIsAdmin || isCreator) ? (
                  participantIsAdmin ? (
                    isCreator && !isSelf ? (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.error, opacity: loadingId === participantUserId ? 0.5 : 1 }]}
                        onPress={() => handleToggleAdmin(participantUserId)}
                        disabled={loadingId === participantUserId}
                        activeOpacity={0.7}
                      >
                        <Ionicons name={'remove-circle'} size={22} color={theme.card} />
                        <Text style={[styles.buttonText, { color: theme.card }]}>
                          {t('adminManagement.removeAdmin')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ color: theme.success, fontWeight: 'bold' }}>{t('adminManagement.alreadyAdmin') || 'Admin'}</Text>
                    )
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: theme.success, opacity: loadingId === participantUserId ? 0.5 : 1 }]}
                      onPress={() => handleToggleAdmin(participantUserId)}
                      disabled={loadingId === participantUserId}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={'person-add'} size={22} color={theme.card} />
                      <Text style={[styles.buttonText, { color: theme.card }]}>
                        {t('adminManagement.addAdmin')}
                      </Text>
                    </TouchableOpacity>
                  )
                ) : (
                  participantIsAdmin ? (
                    <Text style={{ color: theme.success, fontWeight: 'bold' }}>{t('adminManagement.alreadyAdmin') || 'Admin'}</Text>
                  ) : null
                )}
              </TouchableOpacity>
            </Swipeable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 