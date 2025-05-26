import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/user/useUser';
import { getUserById } from '../api/user/userApi';
import { getUserParticipatingPlans } from '../api/plans/plansApi';
import { Plan } from '../models/Plan';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../models/navigation';
import { User } from '../models/User';
import { RouteProp } from '@react-navigation/native';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const isOwnProfile = !route.params?.userId || route.params.userId === currentUser._id;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          setUser(currentUser);
        } else if (route.params?.userId) {
          const userData = await getUserById(route.params.userId);
          setUser(userData);
        }

        const plans = await getUserParticipatingPlans(isOwnProfile ? undefined : route.params?.userId);
        setUserPlans(plans);

      } catch (err: any) {
        console.error('Error loading user or plans:', err);
        setError(err.message || t('profile.errorLoadingProfile'));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isOwnProfile, currentUser, route.params?.userId]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.error }}>{error || t('profile.errorLoadingProfile')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: user.profileImage || "https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746636109/apenmeet/dljiilozwzcmyinqaaeo.jpg" }}
          style={styles.profileImage}
        />
        <Text style={[styles.username, { color: theme.text }]}>{user.username}</Text>
        {user.location && (
          <Text style={[styles.location, { color: theme.textSecondary }]}>
            <Ionicons name="location" size={16} color={theme.textSecondary} /> 
            {user.location.city && user.location.country 
              ? `${user.location.city}, ${user.location.country}`
              : user.location.formattedAddress}
          </Text>
        )}
      </View>

      {user.bio && (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t('profile.about')}</Text>
          <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
        </View>
      )}

      {user.interests && user.interests.some(interest => interest && interest.trim() !== '') && (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t('profile.interests')}</Text>
          <View style={styles.interestsContainer}>
            {user.interests.map((interest: string, index: number) => (
              <View key={index} style={[styles.interestTag, { backgroundColor: theme.primary }]}>
                <Text style={[styles.interestText, { color: theme.card }]}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {isOwnProfile ? t('profile.my_plans') : t('profile.other_user_plans', { username: user.username })}
        </Text>
        {userPlans.length > 0 ? (
          userPlans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={[styles.planCard, { backgroundColor: theme.background }]}
              onPress={() => {
                if (plan._id) {
                  navigation.navigate('PlanDetail', { planId: plan._id });
                }
              }}
            >
              <Text style={[styles.planTitle, { color: theme.text }]}>{plan.title}</Text>
              <Text style={[styles.planDate, { color: theme.textSecondary }]}>
                {new Date(plan.dateTime).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noPlans, { color: theme.textSecondary }]}>{t('profile.noPlans')}</Text>
        )}
      </View>

      {isOwnProfile && (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('EditProfileScreen')}
        >
          <Text style={[styles.editButtonText, { color: theme.card }]}>{t('profile.editButton')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  planCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 14,
  },
  noPlans: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  editButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 