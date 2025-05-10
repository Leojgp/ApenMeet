import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useParticipatingPlans } from '../../hooks/plans/useParticipatingPlans';
import ChatListItem from '../../components/chat/ChatListItem';
import { useFocusEffect } from '@react-navigation/native';

interface ChatsScreenProps {
  navigation: any;
}

export default function ChatsScreen({ navigation }: ChatsScreenProps) {
  const { plans, loading, error, refresh } = useParticipatingPlans();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleChatPress = (plan: any) => {
    navigation.navigate('Chat', { planId: plan._id || plan.id, planTitle: plan.title });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C4D91" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5C4D91']}
            tintColor="#5C4D91"
          />
        }
      >
        {error && <Text style={styles.error}>{error}</Text>}
        {plans.length === 0 && !loading && (
          <Text style={styles.emptyText}>No tienes chats activos</Text>
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
    backgroundColor: '#F7F5FF',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5FF',
  },
  error: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
}); 