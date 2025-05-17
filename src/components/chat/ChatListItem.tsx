import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../models/Plan';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/theme/useTheme';

interface ChatListItemProps {
  plan: Plan;
  onPress: () => void;
}

export default function ChatListItem({ plan, onPress }: ChatListItemProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.card, shadowColor: theme.primary }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="chatbubble-ellipses" size={24} color={theme.primary} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.primary }]}>{plan.title}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>{plan.participants.length} {t('chat.participants')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.primary} />
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