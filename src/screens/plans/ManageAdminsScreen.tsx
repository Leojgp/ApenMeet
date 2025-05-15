import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useUser } from '../../hooks/user/useUser';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { planService } from '../../services/planService';

export default function ManageAdminsScreen({ route }: any) {
  const { planId } = route.params;
  const { plan } = usePlanDetails(planId);
  const { user } = useUser();
  const theme = useTheme();
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [_, forceUpdate] = useState(0);

  if (!plan) return null;

  const isAdmin = (userId: string) => plan.admins.some((a: any) => a._id === userId);

  const handleToggleAdmin = async (participantId: string) => {
    setLoadingId(participantId);
    try {
      if (isAdmin(participantId)) {
        await planService.removeAdmin(plan._id!, participantId);
      } else {
        await planService.addAdmin(plan._id!, participantId);
      }
      forceUpdate(n => n + 1); 
    } catch (e: any) {
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
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: isAdmin(item._id) ? theme.error : theme.success, opacity: loadingId === item._id ? 0.5 : 1 }]}
              onPress={() => handleToggleAdmin(item._id)}
              disabled={loadingId === item._id}
            >
              <Ionicons name={isAdmin(item._id) ? 'remove-circle' : 'person-add'} size={22} color={theme.card} />
              <Text style={[styles.buttonText, { color: theme.card }]}> 
                {isAdmin(item._id) ? t('adminManagement.removeAdmin') : t('adminManagement.addAdmin')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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