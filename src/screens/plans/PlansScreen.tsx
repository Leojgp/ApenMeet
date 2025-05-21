import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, RefreshControl, FlatList, Modal, ScrollView } from 'react-native'
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
import * as Location from 'expo-location';

interface Admin {
  id: string;
  _id?: string;
  username: string;
}

interface PlansScreenProps {
  navigation: any;
}

interface City {
  name: string;
  country: string;
}

interface CitySuggestion {
  city: string;
  country: string;
  coordinates: [number, number];
  formattedAddress: string;
  postalCode?: string;
  region?: string;
}

export default function PlansScreen({navigation}: PlansScreenProps) {
  const { plans, loading, error, refresh, myCreatedPlans, myJoinedPlans } = usePlans();
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterByCity, setFilterByCity] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

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

  const handleSearchBlur = () => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  useEffect(() => {
    if (!selectedCity && !userCity) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        const [place] = await Location.reverseGeocodeAsync(location.coords);
        setUserCity(place.city);
        setUserCountry(place.country);
        refresh(place.city ?? undefined, place.country ?? undefined);
      })();
    }
  }, [selectedCity, userCity]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedCity && selectedCountry) {
      await refresh(selectedCity || undefined, selectedCountry || undefined);
    } else if (userCity && userCountry) {
      await refresh(userCity || undefined, userCountry || undefined);
    } else {
      await refresh();
    }
    setRefreshing(false);
  }, [refresh, selectedCity, selectedCountry, userCity, userCountry]);

  useFocusEffect(
    useCallback(() => {
      if (isInitialLoad) {
        if (selectedCity && selectedCountry) {
          refresh(selectedCity || undefined, selectedCountry || undefined);
        } else if (userCity && userCountry) {
          refresh(userCity || undefined, userCountry || undefined);
        } else {
          refresh();
        }
        setIsInitialLoad(false);
      }
    }, [refresh, isInitialLoad, selectedCity, selectedCountry, userCity, userCountry])
  );

  const handleTabChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  const routes = useMemo(() => [
    { key: 'all', title: t('plans.allPlans') },
    { key: 'created', title: t('plans.createdPlans') },
    { key: 'joined', title: t('plans.joinedPlans') },
  ], [t, i18n.language]);

  const debouncedGeocode = useCallback(
    debounce(async (text: string) => {
      if (text.length < 3) {
        setShowResults(false);
        setSearchResults([]);
        setFilterByCity(false);
        return;
      }
      const results = await Location.geocodeAsync(text);
      if (results.length > 0 && text.length > 2) {
        setShowResults(false);
        setSearchResults(results.map(r => {
          const city = (r as any).city || (r as any).locality || text;
          const street = (r as any).street || '';
          const country = (r as any).country || '';
          return {
            city,
            formattedAddress: street ? `${street}, ${city}, ${country}` : `${city}, ${country}`,
            ...r
          };
        }));
      } else {
        setShowResults(false);
        setSearchResults([]);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    debouncedGeocode(cityInput);
  }, [cityInput]);

  const handleCityChange = (text: string) => {
    setCityInput(text);
    debouncedGeocode(text);
  };

  const handleResultSelect = (result: any) => {
    setSelectedCity(result.city);
    setSelectedCountry(result.country);
    refresh(result.city || undefined, result.country || undefined);
  };

  const clearCityInput = () => {
    setSelectedCity(null);
    setSelectedCountry(null);
    if (userCity && userCountry) {
      refresh(userCity || undefined, userCountry || undefined);
    } else {
      refresh();
    }
  };

  const handleCitySearch = async (text: string) => {
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      setIsLoadingLocation(true);
      setLocationError(null);
      const results = await Location.geocodeAsync(text);
      if (results.length > 0) {
        const locations = await Promise.all(
          results.map(async (result) => {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude
            });
            if (reverseGeocode.length > 0) {
              const location = reverseGeocode[0];
              return {
                city: location.city || '',
                country: location.country || '',
                coordinates: [result.longitude, result.latitude],
                formattedAddress: [
                  location.street,
                  location.city,
                  location.region,
                  location.postalCode,
                  location.country
                ].filter(Boolean).join(', ')
              };
            }
            return null;
          })
        );
        setSearchResults(locations.filter(Boolean));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setLocationError('Error al buscar la ciudad');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const debouncedCitySearch = useCallback(
    debounce(async (city: string, country: string) => {
      if (city.length < 3 || !country) {
        setCitySuggestions([]);
        return;
      }
      setIsLoadingCities(true);
      setLocationError('');
      try {
        const query = `${city}, ${country}`;
        const results = await Location.geocodeAsync(query);
        if (results.length > 0) {
          const suggestions = await Promise.all(
            results.map(async (result) => {
              const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude
              });
              if (reverseGeocode.length > 0) {
                const location = reverseGeocode[0];
                return {
                  city: location.city || city,
                  country: location.country || country,
                  coordinates: [result.longitude, result.latitude],
                  formattedAddress: location.formattedAddress || `${city}, ${country}`,
                  postalCode: location.postalCode || '',
                  region: location.region || '',
                };
              }
              return null;
            })
          );
          setCitySuggestions(suggestions.filter(Boolean) as CitySuggestion[]);
        } else {
          setCitySuggestions([]);
        }
      } catch (e) {
        setLocationError('Error buscando la ciudad.');
        setCitySuggestions([]);
      } finally {
        setIsLoadingCities(false);
      }
    }, 1000),
    [selectedCountry]
  );

  useEffect(() => {
    debouncedCitySearch(cityInput, selectedCountry || '');
  }, [cityInput, selectedCountry, debouncedCitySearch]);

  const handleCitySelect = (location: any) => {
    setSelectedCity(location.city);
    setSelectedCountry(location.country);
    setCityInput(location.formattedAddress);
    setShowCityModal(false);
    refresh(location.city || undefined, location.country || undefined);
  };

  const handleApplyCityFilter = () => {
    setShowCityModal(false);
    if (cityInput && selectedCity) {
      setFilterByCity(true);
      refresh(selectedCity || undefined, selectedCountry || undefined);
    } else {
      setFilterByCity(false);
      refresh();
    }
  };

  const memoizedPlans = useMemo(() => {
    const basePlans = index === 0 ? plans : 
                     index === 1 ? myCreatedPlans : 
                     myJoinedPlans;

    if (filterByCity && selectedCity) {
      return basePlans.filter(plan => {
        const planCity = plan.location?.city?.toLowerCase() || '';
        const planCountry = plan.location?.country?.toLowerCase() || '';
        return (
          planCity.includes(selectedCity.toLowerCase()) &&
          (!selectedCountry || planCountry.includes(selectedCountry.toLowerCase()))
        );
      });
    }
    return basePlans;
  }, [index, plans, myCreatedPlans, myJoinedPlans, filterByCity, selectedCity, selectedCountry]);

  const filteredPlans = useMemo(() => {
    if (!debouncedSearch) return memoizedPlans;
    const searchTerm = debouncedSearch.toLowerCase();
    return memoizedPlans.filter(plan => 
      plan.title.toLowerCase().includes(searchTerm) ||
      plan.description?.toLowerCase().includes(searchTerm)
    );
  }, [memoizedPlans, debouncedSearch]);

  const groupedPlans = useMemo(() => {
    return Object.values(filteredPlans.reduce((acc, plan) => {
      const date = new Date(plan.dateTime).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(plan);
      return acc;
    }, {} as Record<string, Plan[]>));
  }, [filteredPlans]);

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
        ref={searchInputRef}
        style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder={t('plans.searchByName')}
        placeholderTextColor={theme.placeholder}
        value={search}
        onChangeText={handleSearchChange}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {index === 0 && (
        <TouchableOpacity 
          style={[styles.cityFilter, { backgroundColor: theme.primary }]} 
          onPress={() => setShowCityModal(true)}
        >
          <Text style={styles.cityFilterText}>
            {selectedCity
              ? selectedCountry
                ? `${selectedCity}, ${selectedCountry}`
                : selectedCity
              : t('plans.filterByCity')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), [search, theme, t, selectedCity, selectedCountry, index]);

  const renderCityModal = () => (
    <Modal
      visible={showCityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCityModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}> 
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('plans.searchCity')}</Text>
            <TouchableOpacity onPress={() => setShowCityModal(false)}>
              <Text style={[styles.closeButton, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder={t('plans.searchCityPlaceholder')}
              placeholderTextColor={theme.placeholder}
              value={cityInput}
              onChangeText={handleCityInputChange}
              autoFocus
            />
            {isLoadingCities && <ActivityIndicator size="small" color={theme.primary} />}
          </View>

          {citySuggestions.length > 0 && (
            <ScrollView style={[styles.suggestionsList, { maxHeight: 220 }]}>
              {citySuggestions.map((city, index) => (
                <TouchableOpacity
                  key={`${city.city}-${city.country}-${index}`}
                  style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setSelectedCity(city.city);
                    setSelectedCountry(city.country);
                    setCityInput(city.formattedAddress);
                    setShowCityModal(false);
                    refresh(city.city, city.country);
                  }}
                >
                  <Text style={[styles.suggestionText, { color: theme.text, fontWeight: 'bold', fontSize: 16 }]}>{city.formattedAddress || `${city.city}, ${city.country}`}</Text>
                  <Text style={[styles.suggestionText, { color: theme.text, fontSize: 13 }]}>{city.city}, {city.region ? city.region + ', ' : ''}{city.country}</Text>
                  {city.postalCode ? (
                    <Text style={[styles.suggestionText, { color: theme.placeholder, fontSize: 12 }]}>{city.postalCode}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

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
      keyboardShouldPersistTaps="handled"
    />
  ), [uniquePlans, renderItem, refreshing, onRefresh, loading, error, theme, t]);

  const renderTabBar = useCallback((props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: theme.card }}
      indicatorStyle={{ backgroundColor: theme.primary }}
      activeColor={theme.primary}
      inactiveColor={theme.text}
    />
  ), [theme]);

  const handleCityInputChange = (text: string) => {
    setCityInput(text);
    if (text.trim() === '') {
      setSelectedCity(userCity);
      setSelectedCountry(userCountry);
      if (userCity && userCountry) {
        debouncedCitySearch(userCity, userCountry);
        refresh(userCity, userCountry);
      }
      return;
    }
    const [city, country] = text.split(',').map(s => s.trim());
    if (city && country) {
      setSelectedCity(city);
      setSelectedCountry(country);
      debouncedCitySearch(city, country);
    } else {
      debouncedCitySearch(city, selectedCountry || userCountry || '');
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: theme.background}}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={({ route }) => (
            <>
              <View style={styles.searchBarContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('plans.searchByName')}
                  placeholderTextColor={theme.placeholder}
                  value={search}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                {index === 0 && (
                  <TouchableOpacity 
                    style={[styles.cityFilter, { backgroundColor: theme.primary }]} 
                    onPress={() => setShowCityModal(true)}
                  >
                    <Text style={styles.cityFilterText}>
                      {selectedCity
                        ? selectedCountry
                          ? `${selectedCity}, ${selectedCountry}`
                          : selectedCity
                        : t('plans.filterByCity')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {renderScene({ route })}
            </>
          )}
          onIndexChange={handleTabChange}
          initialLayout={{ width: 100 }}
          renderTabBar={renderTabBar}
          lazy={true}
          lazyPreloadDistance={0}
        />
        {renderCityModal()}
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
    justifyContent: 'flex-start',
    marginBottom: 18,
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 0,
    backgroundColor: '#fff',
    minWidth: 0,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  locationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  locationItemText: {
    fontSize: 16,
  },
  locationLoader: {
    marginVertical: 10,
  },
  errorText: {
    marginVertical: 10,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cityFilter: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    minWidth: 0,
    alignSelf: 'center',
    marginLeft: 8,
  },
  cityFilterText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
});