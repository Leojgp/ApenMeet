import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Animated, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plan } from '../../../models/Plan';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../hooks/user/useUser';
import { deletePlan } from '../../../api/plans/plansApi';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { useTheme } from '../../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import SharePlanButton from '../SharePlanButton';

interface PlanCardProps {
  plan: Plan;
  navigation: any;
  onPlanDeleted?: () => void;
}

const DEFAULT_IMAGE_URL = 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg';

export default function PlanCard({ plan, navigation, onPlanDeleted }: PlanCardProps) {
  const { user } = useUser();
  const swipeableRef = useRef<Swipeable>(null);
  const isAdmin = plan.admins?.some(admin => admin._id === user?._id || (admin as any).id === user?._id);
  const isCreator = plan.creatorId === user?._id;
  const theme = useTheme();
  const { t } = useTranslation();

  const planIdToUse = plan._id || plan.id;

  const handlePress = () => {
    navigation.navigate('PlanDetail', { planId: String(planIdToUse) });
  };

  const handleEdit = () => {
    navigation.navigate('EditPlan', { planId: String(planIdToUse) });
  };

  const handleDelete = async () => {
    Alert.alert(
      t('alerts.deletePlan.title'),
      t('alerts.deletePlan.message'),
      [
        { text: t('alerts.deletePlan.cancel'), style: 'cancel' },
        {
          text: t('alerts.deletePlan.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlan(String(plan.id));
              onPlanDeleted?.();
            } catch (error) {
              Alert.alert('Error', t('alerts.errors.deletePlan'));
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${plan.title}\n\n${plan.description}\n\nDate: ${new Date(plan.dateTime).toLocaleDateString()}\nLocation: ${plan.location?.city}, ${plan.location?.country}\n\nJoin me on ApenMeet!`,
        title: plan.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the plan');
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    if (!isAdmin && !isCreator) return null;
    
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    return (
      <RectButton style={styles.rightAction} onPress={handleEdit}>
        <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
          <Ionicons name="pencil" size={24} color="#fff" />
          <Text style={styles.actionText}>{t('plans.edit.title')}</Text>
        </Animated.View>
      </RectButton>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    if (!isCreator) return null;

    const trans = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [-100, 0],
    });

    return (
      <RectButton style={styles.leftAction} onPress={handleDelete}>
        <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionText}>{t('alerts.deletePlan.title')}</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
      overshootRight={false}
      overshootLeft={false}
      onSwipeableOpen={() => {
        setTimeout(() => {
          swipeableRef.current?.close();
        }, 2000);
      }}
    >
      <TouchableOpacity onPress={handlePress} style={[styles.cardContainer, { backgroundColor: theme.card }]}>
        <Image 
          source={{ uri: plan.imageUrl || DEFAULT_IMAGE_URL }} 
          style={[styles.image, { backgroundColor: theme.background }]} 
        />
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.primary }]}>{plan.title}</Text>
            <View style={styles.headerButtons}>
              {(isAdmin || isCreator) && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ManageAdmins', { planId: planIdToUse })}
                  style={styles.adminButton}
                >
                  <Ionicons name="people" size={22} color={theme.primary} />
                </TouchableOpacity>
              )}
              <SharePlanButton onPress={handleShare} />
            </View>
          </View>
          
          {plan.admins && plan.admins.length > 0 && (
            <Text style={[styles.admins, { color: theme.text }]}>{'Admins: ' + plan.admins.map(a => a.username).join(', ')}</Text>
          )}
          
          <Text style={[styles.description, { color: theme.text }]} numberOfLines={2}>{plan.description}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: theme.background }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>{new Date(plan.dateTime).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.background }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>{plan.participants.length} going</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  adminButton: {
    padding: 4,
  },
  admins: {
    fontSize: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rightAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 140,
    marginBottom: 16,
    borderRadius: 12,
  },
  leftAction: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 140,
    marginBottom: 16,
    borderRadius: 12,
  },
  actionContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 6,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

