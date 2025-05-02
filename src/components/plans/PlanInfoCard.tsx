import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlanInfoCardProps {
  title: string;
  content: string;
  badges?: {
    dateTime: string;
    participantsCount: number;
    status: string;
  };
}

export default function PlanInfoCard({ title, content, badges }: PlanInfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{content}</Text>
      {badges && (
        <View style={styles.badgesRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{badges.dateTime}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{badges.participantsCount} going</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{badges.status}</Text></View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#5C4D91',
    fontSize: 16,
    marginBottom: 6,
  },
  sectionText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#E6E0F8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#5C4D91',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 