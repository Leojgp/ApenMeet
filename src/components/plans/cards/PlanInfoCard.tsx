import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/theme/useTheme';

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
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>{title}</Text>
      <Text style={[styles.sectionText, { color: theme.text }]}>{content}</Text>
      {badges && (
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: theme.background }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{badges.dateTime}</Text></View>
          <View style={[styles.badge, { backgroundColor: theme.background }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{badges.participantsCount} going</Text></View>
          <View style={[styles.badge, { backgroundColor: theme.background }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{badges.status}</Text></View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    fontSize: 16,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 