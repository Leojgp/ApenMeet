import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useUser } from '../../hooks/user/useUser';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { planService } from '../../services/planService';

export default function ManageAdminsScreen({ route }: any) {
  const { planId } = route.params;
  const { plan, loading, refetch } = usePlanDetails(planId);
  const { user } = useUser();
  const theme = useTheme();
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        await planService.removeAdmin(planIdToUse, userId);
      } else {
        await planService.addAdmin(planIdToUse, userId);
      }
      await refetch();
    } catch (e: any) {
      console.error('Error:', e);
      Alert.alert('Error', e?.response?.data?.error || 'Error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.primary }]}>{t('adminManagement.title')}</Text>
      <FlatList
        data={plan.participants}
        keyExtractor={item => String(item._id)}
        renderItem={({ item }) => {
          const participantUserId = getUserId(item.id);
          const participantIsAdmin = isAdmin(participantUserId);
          return (
            <View style={styles.row}>
              <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
              {participantIsAdmin ? (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.error, opacity: loadingId === participantUserId ? 0.5 : 1 }]}
                  onPress={() => handleToggleAdmin(participantUserId)}
                  disabled={loadingId === participantUserId}
                >
                  <Ionicons name={'remove-circle'} size={22} color={theme.card} />
                  <Text style={[styles.buttonText, { color: theme.card }]}> 
                    {t('adminManagement.removeAdmin')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.success, opacity: loadingId === participantUserId ? 0.5 : 1 }]}
                  onPress={() => handleToggleAdmin(participantUserId)}
                  disabled={loadingId === participantUserId}
                >
                  <Ionicons name={'person-add'} size={22} color={theme.card} />
                  <Text style={[styles.buttonText, { color: theme.card }]}> 
                    {t('adminManagement.addAdmin')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
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
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
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