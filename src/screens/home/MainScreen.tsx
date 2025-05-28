import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { eventService } from '../../services/eventService';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { ScrapedEvent } from '../../models/ScrapedEvent';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

export default function MainScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user);
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

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
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
        {item.location && <Text style={[styles.cardLocation, { color: theme.placeholder }]}>{t('events.location') + ': ' + item.location}</Text>}
        {item.date && <Text style={[styles.cardDate, { color: theme.primary }]}>{t('events.date') + ': ' + item.date}</Text>}
        {item.price && <Text style={[styles.cardPrice, { color: theme.primary }]}>{t('events.price') + ': ' + item.price}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={[styles.errorText, { color: theme.error, marginBottom: 24 }]}>{error}</Text>
        {error.includes('iniciar sesión') && (
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={[styles.loginButtonText, { color: theme.card }]}>Iniciar Sesión</Text>
          </TouchableOpacity>
        )}
        {error.includes('ubicación') && (
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.loginButtonText, { color: theme.card }]}>Actualizar Ubicación</Text>
          </TouchableOpacity>
        )}
        {!error.includes('iniciar sesión') && !error.includes('ubicación') && (
          <TouchableOpacity 
            style={{ backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 }}
            onPress={onRefresh}
          >
            <Text style={{ color: theme.card, fontWeight: 'bold', fontSize: 16 }}>Recargar eventos</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, marginBottom: 8 }}>{t('events.empty.title')}</Text>
        <Text style={{ color: theme.text, marginBottom: 24 }}>{t('events.empty.message')}</Text>
        <TouchableOpacity style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }} onPress={onRefresh}>
          <Text style={{ color: theme.card, fontWeight: 'bold', fontSize: 16 }}>{t('events.empty.refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {user.location?.city && user.location?.country && (
        <Text style={{
          color: theme.primary,
          fontWeight: 'bold',
          fontSize: 22,
          marginTop: 20,
          marginBottom: 16,
          textAlign: 'center',
        }}>
          {t('events.showingIn', { city: user.location.city, country: user.location.country })}
        </Text>
      )}
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <>
            {loading && !refreshing && <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 20}} />}
            {error && !loading && (
              error.includes('No events found for this city') ? (
                <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
                   <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, marginBottom: 8 }}>{t('events.empty.title')}</Text>
                   <Text style={{ color: theme.text, marginBottom: 24 }}>{t('events.empty.message')}</Text>
                   <TouchableOpacity style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }} onPress={onRefresh}>
                     <Text style={{ color: theme.card, fontWeight: 'bold', fontSize: 16 }}>{t('events.empty.refresh')}</Text>
                   </TouchableOpacity>
                 </View>
              ) : (
                <Text style={[styles.notFound, { color: theme.error, marginTop: 20 }]}>{error}</Text>
              )
            )}
            {!error && !loading && events.length === 0 && (
               <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}> 
                   <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, marginBottom: 8 }}>{t('events.empty.title')}</Text>
                   <Text style={{ color: theme.text, marginBottom: 24 }}>{t('events.empty.message')}</Text>
                   <TouchableOpacity style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }} onPress={onRefresh}>
                     <Text style={{ color: theme.card, fontWeight: 'bold', fontSize: 16 }}>{t('events.empty.refresh')}</Text>
                   </TouchableOpacity>
                 </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  listContainer: {
    padding: 16,
  },
  card: {
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
  },
  cardLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    margin: 16,
  },
  loginButton: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  loginButtonText: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notFound: {
    textAlign: 'center',
    margin: 16,
  },
});
