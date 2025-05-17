import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plan } from '../../../models/Plan';
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../hooks/user/useUser';
import { deletePlan } from '../../../api/plans/plansApi';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { useTheme } from '../../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

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

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    if (!isAdmin) return null;
    
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
        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.title, { color: theme.primary, flex: 1 }]}>{plan.title}</Text>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ManageAdmins', { planId: planIdToUse })}
                style={{ marginLeft: 8, padding: 4 }}
              >
                <Ionicons name="people" size={22} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          {plan.admins && plan.admins.length > 0 && (
            <Text style={[styles.admins, { color: theme.text }]}>{'Admins: ' + plan.admins.map(a => a.username).join(', ')}</Text>
          )}
          <Text style={[styles.subtitle, { color: theme.text }]}>{plan.description}</Text>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: theme.background }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{new Date(plan.dateTime).toLocaleDateString()}</Text></View>
            <View style={[styles.badge, { backgroundColor: theme.background }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{plan.participants.length} going</Text></View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 18,
    shadowColor: '#5C4D91',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 14,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  admins: {
    fontSize: 12,
    marginBottom: 2,
  },
  badgesRow: {
    flexDirection: 'row',
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
  rightAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
    marginBottom: 20,
    borderRadius: 18,
  },
  leftAction: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 100,
    marginBottom: 20,
    borderRadius: 18,
  },
  actionContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
});

