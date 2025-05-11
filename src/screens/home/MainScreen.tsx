import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import BottomTabMenu from '../../components/navigation/BottomTabMenu';
import LocationRequest from '../../components/auth/LocationRequest';
import { eventService } from '../../services/eventService';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { ScrapedEvent } from '../../models/ScrapedEvent';

export default function MainScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user);
  const [showLocationRequest, setShowLocationRequest] = useState(
    !user.location?.coordinates || 
    (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)
  );
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      const scrapedEvents = await eventService.getScrapedEvents();
      setEvents(scrapedEvents);
      setError(null);
    } catch (err) {
      setError('Error al cargar los eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadEvents();
    }, [])
  );

  const checkAuthAndLoadEvents = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        setError('Debes iniciar sesión para ver los eventos');
        setLoading(false);
        return;
      }
      await loadEvents();
    } catch (err) {
      console.error('Error checking auth:', err);
      setError('Error al verificar la autenticación');
      setLoading(false);
    }
  };

  const handleLocationSet = () => {
    setShowLocationRequest(false);
  };

  const renderEventCard = ({ item }: { item: ScrapedEvent }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.location && <Text style={styles.cardLocation}>{item.location}</Text>}
        {item.date && <Text style={styles.cardDate}>{item.date}</Text>}
        {item.price && <Text style={styles.cardPrice}>{item.price}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (showLocationRequest) {
    return <LocationRequest onLocationSet={handleLocationSet} />;
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5C4D91" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        {error.includes('iniciar sesión') && (
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos en Granada</Text>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5C4D91']}
            tintColor="#5C4D91"
          />
        }
      />
      <BottomTabMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#5C4D91',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#5C4D91',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C4D91',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
  loginButton: {
    backgroundColor: '#5C4D91',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
