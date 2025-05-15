import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { Plan } from '../../models/Plan';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PlanCardProps {
  plan: Plan;
  onPress: (plan: Plan) => void;
  onSavePress?: (plan: Plan) => void;
  isSaved?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onPress,
  onSavePress,
  isSaved = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={() => onPress(plan)}
    >
      {plan.imageUrl && (
        <Image
          source={{ uri: plan.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {plan.title}
          </Text>
          {onSavePress && (
            <TouchableOpacity
              onPress={() => onSavePress(plan)}
              style={styles.saveButton}
            >
              <Icon
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? theme.primary : theme.text}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.description, { color: theme.text }]} numberOfLines={2}>
          {plan.description}
        </Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={theme.text} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {formatDate(plan.dateTime)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="map-marker" size={16} color={theme.text} />
            <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
              {plan.location.address}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="account-group" size={16} color={theme.text} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {plan.participants.length}/{plan.maxParticipants} {t('plans.participants')}
            </Text>
          </View>
        </View>
        <View style={styles.tags}>
          {plan.tags.map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: theme.primary + '20' }]}
            >
              <Text style={[styles.tagText, { color: theme.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 