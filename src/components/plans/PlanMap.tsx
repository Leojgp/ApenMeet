import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface PlanMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
}

export default function PlanMap({
  latitude,
  longitude,
  title,
  address,
  mapReady,
  setMapReady
}: PlanMapProps) {
  return (
    <View style={styles.mapCard}>
      {latitude && longitude ? (
        <MapView
          style={styles.map}
          onMapReady={() => setMapReady(true)}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {mapReady && (
            <Marker
              coordinate={{ latitude, longitude }}
              title={title}
              description={address}
            />
          )}
        </MapView>
      ) : (
        <Text style={styles.locationMissing}>No location coordinates available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 18,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  locationMissing: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
  },
}); 