import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useParticipatingPlans } from '../../hooks/plans/useParticipatingPlans';
import ChatListItem from '../../components/chat/ChatListItem';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface ChatsScreenProps {
  navigation: any;
}

export default function ChatsScreen({ navigation }: ChatsScreenProps) {
  const { plans, loading, error, refresh } = useParticipatingPlans();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleChatPress = (plan: any) => {
    navigation.navigate('Chat', {
      planId: plan._id,
      planTitle: plan.title
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}
        {plans.length === 0 && !loading && (
          <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}> 
            <Ionicons name="chatbubble-outline" size={64} color={theme.primary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.primary }]}>{t('chat.title')}</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>{t('chat.joinToChat')}</Text>
            <TouchableOpacity 
              style={[styles.joinButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Plans')}
            >
              <Text style={[styles.joinButtonText, { color: theme.card }]}>{t('plans.detail.join')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {plans.map((plan) => (
          <ChatListItem
            key={plan._id || plan.id}
            plan={plan}
            onPress={() => handleChatPress(plan)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    marginTop: 120,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  joinButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 