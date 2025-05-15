import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, RefreshControl, FlatList } from 'react-native'
import React, { useState, useCallback, useMemo } from 'react'
import PlanCard from '../../components/plans/cards/PlanCard';
import { usePlans } from '../../hooks/plans/usePlans';
import { useUser } from '../../hooks/user/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Plan } from '../../models/Plan';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar } from 'react-native-tab-view';
import debounce from 'lodash/debounce';

interface Admin {
  id: string;
  _id?: string;
  username: string;
}

interface PlansScreenProps {
  navigation: any;
}

export default function PlansScreen({navigation}: PlansScreenProps) {
  const { plans, loading, error, refresh, myCreatedPlans, myJoinedPlans } = usePlans();
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterByCity, setFilterByCity] = useState(false);
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const { t } = useTranslation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSetSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearch(text);
    }, 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    debouncedSetSearch(text);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      if (isInitialLoad) {
        refresh();
        setIsInitialLoad(false);
      }
    }, [refresh, isInitialLoad])
  );

  const handleTabChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  const [routes] = useState([
    { key: 'all', title: t('plans.allPlans') },
    { key: 'created', title: t('plans.createdPlans') },
    { key: 'joined', title: t('plans.joinedPlans') },
  ]);

  const memoizedPlans = useMemo(() => {
    const basePlans = index === 0 ? plans : 
                     index === 1 ? myCreatedPlans : 
                     myJoinedPlans;

    if (filterByCity && user?.location?.city) {
      const userCity = user.location.city.toLowerCase();
      return basePlans.filter(plan => 
        plan.location?.address?.toLowerCase().includes(userCity)
      );
    }
    return basePlans;
  }, [index, plans, myCreatedPlans, myJoinedPlans, filterByCity, user?.location?.city]);

  const filteredPlans = useMemo(() => {
    if (!debouncedSearch) return memoizedPlans;

    const searchTerm = debouncedSearch.toLowerCase();
    return memoizedPlans.filter(plan => 
      plan.title.toLowerCase().includes(searchTerm) ||
      plan.description?.toLowerCase().includes(searchTerm)
    );
  }, [memoizedPlans, debouncedSearch]);

  const uniquePlans = useMemo(() => 
    Object.values(filteredPlans.reduce((acc, plan) => {
      const key = plan.title + '_' + plan.admins.map((admin: Admin) => admin._id).join(',');
      if (!acc[key]) {
        acc[key] = plan;
      }
      return acc;
    }, {} as Record<string, Plan>))
  , [filteredPlans]);

  const renderHeader = useCallback(() => (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('plans.searchByName')}
        placeholderTextColor={theme.placeholder}
        value={search}
        onChangeText={handleSearchChange}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {user?.location?.city && (
        <TouchableOpacity 
          style={[styles.filterButton, filterByCity && [styles.filterButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }], { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setFilterByCity(!filterByCity)}
        >
          <Ionicons name="location" size={24} color={filterByCity ? theme.card : theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  ), [search, filterByCity, theme, user?.location?.city, t]);

  const renderItem = useCallback(({ item: plan }: { item: Plan }) => (
    <PlanCard 
      key={plan.id} 
      plan={plan} 
      navigation={navigation} 
      onPlanDeleted={refresh}
    />
  ), [navigation, refresh]);

  const renderScene = useCallback(({ route }: { route: { key: string } }) => (
    <FlatList
      data={uniquePlans}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      ListHeaderComponent={renderHeader}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      ListEmptyComponent={
        <>
          {loading && <ActivityIndicator size="small" color={theme.primary} style={{marginBottom: 16}} />}
          {error && !loading && <Text style={[styles.notFound, { color: theme.error }]}>{error}</Text>}
          {!error && !loading && <Text style={[styles.notFound, { color: theme.text }]}>{t('plans.notFound')}</Text>}
        </>
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  ), [uniquePlans, renderItem, renderHeader, refreshing, onRefresh, loading, error, theme, t]);

  const renderTabBar = useCallback((props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: theme.card }}
      indicatorStyle={{ backgroundColor: theme.primary }}
      activeColor={theme.primary}
      inactiveColor={theme.text}
    />
  ), [theme]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: theme.background}}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={handleTabChange}
          initialLayout={{ width: 100 }}
          renderTabBar={renderTabBar}
          lazy={true}
          lazyPreloadDistance={0}
        />
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('CreatePlan')}>
          <Ionicons name="add" size={36} color={theme.card} />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterButtonActive: {},
  notFound: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
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