import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import PlanCard from '../components/plans/PlanCard';
import { usePlans } from '../hooks/usePlans';
import { useUser } from '../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';

interface PlansScreenProps{
    navigation: any;
}

export default function PlansScreen({navigation}:PlansScreenProps) {
    const { plans, loading, error } = usePlans();
    const { user } = useUser();
    const [search, setSearch] = useState('');

    let filteredPlans = plans;
    if (user?.location?.city) {
      const userCity = user.location.city;
      filteredPlans = filteredPlans.filter(plan => plan.location && plan.location.address && plan.location.address.toLowerCase().includes(userCity.toLowerCase()));
    }
    if (search) {
      filteredPlans = filteredPlans.filter(plan => plan.title.toLowerCase().includes(search.toLowerCase()));
    }
    const uniquePlans = Object.values(filteredPlans.reduce((acc, plan) => {
      if (!acc[plan.title + '_' + plan.admins.map(a => a.id).join(',')]) {
        acc[plan.title + '_' + plan.admins.map(a => a.id).join(',')] = plan;
      }
      return acc;
    }, {} as Record<string, any>));

    return (
      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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