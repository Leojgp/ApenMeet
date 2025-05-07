import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useCallback } from 'react'
import PlanCard from '../../components/plans/cards/PlanCard';
import { usePlans } from '../../hooks/plans/usePlans';
import { useUser } from '../../hooks/user/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

interface Admin {
  id: string;
  username: string;
}

interface Plan {
  id: string;
  title: string;
  location: {
    address: string;
  };
  admins: Admin[];
}

interface PlansScreenProps {
  navigation: any;
}

export default function PlansScreen({navigation}: PlansScreenProps) {
  const { plans, loading, error, refresh } = usePlans();
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  let filteredPlans = plans;
  if (user?.location?.city) {
    const userCity = user.location.city;
    filteredPlans = filteredPlans.filter(plan => plan.location && plan.location.address && plan.location.address.toLowerCase().includes(userCity.toLowerCase()));
  }
  if (search) {
    filteredPlans = filteredPlans.filter(plan => plan.title.toLowerCase().includes(search.toLowerCase()));
  }
  const uniquePlans = Object.values(filteredPlans.reduce((acc, plan) => {
    if (!acc[plan.title + '_' + plan.admins.map((admin: Admin) => admin.id).join(',')]) {
      acc[plan.title + '_' + plan.admins.map((admin: Admin) => admin.id).join(',')] = plan;
    }
    return acc;
  }, {} as Record<string, Plan>));

  return (
    <View style={{flex: 1}}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5C4D91']}
            tintColor="#5C4D91"
          />
        }
      >
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name"
            placeholderTextColor="#A9A9A9"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        {loading && <ActivityIndicator size="small" color="#5C4D91" style={{marginBottom: 16}} />}
        {error && <Text style={styles.notFound}>{error}</Text>}
        {uniquePlans.length === 0 && !loading && <Text style={styles.notFound}>No plan found</Text>}
        {uniquePlans.map((plan: any) => (
          <PlanCard key={plan.id} plan={plan} navigation={navigation} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePlan')}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 18,
    paddingTop: 24,
    minHeight: '100%',
    alignItems: 'stretch',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7F5FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6E0F8',
    marginRight: 8,
  },
  notFound: {
    color: '#f44336',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#5C4D91',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});