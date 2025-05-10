import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../models/Plan';

interface ChatListItemProps {
  plan: Plan;
  onPress: () => void;
}

export default function ChatListItem({ plan, onPress }: ChatListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#5C4D91" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.subtitle}>{plan.participants.length} participantes</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#5C4D91" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4D91',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
}); 