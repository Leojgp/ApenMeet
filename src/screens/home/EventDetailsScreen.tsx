import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrapedEvent } from '../../models/ScrapedEvent';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';


type RootStackParamList = {
  EventDetails: { event: ScrapedEvent };
};

type EventDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'EventDetails'>;
  navigation: StackNavigationProp<RootStackParamList, 'EventDetails'>;
};

export default function EventDetailsScreen({ route }: EventDetailsScreenProps) {
  const { event } = route.params;
  const theme = useTheme();
  const { t } = useTranslation();

  const handleOpenUrl = async () => {
    try {
      await Linking.openURL(event.url);
    } catch (error) {
      console.error('Error al abrir la URL:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Image 
        source={{ uri: event.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image}
      />
      <View style={[styles.content, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
        
        {event.location && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.primary }]}>{t('events.location') || 'Ubicación'}:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{event.location}</Text>
          </View>
        )}

        {event.date && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.primary }]}>{t('events.date') || 'Fecha'}:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{event.date}</Text>
          </View>
        )}

        {event.price && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.primary }]}>{t('events.price') || 'Precio'}:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{event.price}</Text>
          </View>
        )}

        <Text style={[styles.description, { color: theme.text }]}>{event.description}</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleOpenUrl}>
          <Text style={[styles.buttonText, { color: theme.card }]}>{t('events.seeMoreInfo') || 'Ver más información'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C4D91',
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#5C4D91',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 