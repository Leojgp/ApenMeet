import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import BottomTabMenu from '../../components/navigation/BottomTabMenu';
import { eventService } from '../../services/eventService';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { ScrapedEvent } from '../../models/ScrapedEvent';
import { Ionicons } from '@expo/vector-icons';

export default function MainScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user);
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      if (!user.location?.city || !user.location?.country) {
        setError('Necesitamos tu ubicación para mostrarte eventos');
        setLoading(false);
        return;
      }

      const scrapedEvents = await eventService.getScrapedEvents(
        user.location.city,
        user.location.country
      );
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
  }, [user.location]);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadEvents();
    }, [user.location])
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
        {error.includes('ubicación') && (
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.loginButtonText}>Actualizar Ubicación</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Eventos en {user.location?.city}</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={() => navigation.navigate('Config')}
        >
          <Ionicons name="location-outline" size={24} color="#5C4D91" />
        </TouchableOpacity>
      </View>
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#5C4D91" />
          <Text style={styles.emptyTitle}>No hay eventos disponibles</Text>
          <Text style={styles.emptyText}>
            No hemos encontrado eventos en {user.location?.city}. Prueba con otra ciudad o vuelve más tarde.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.emptyButtonText}>Cambiar Ciudad</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
      <BottomTabMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#5C4D91',
  },
  locationButton: {
    padding: 8,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#5C4D91',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
