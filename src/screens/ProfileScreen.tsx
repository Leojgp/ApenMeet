import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { getUserParticipatingPlans } from '../api/plans/plansApi';
import PlanCard from '../components/plans/cards/PlanCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../models/navigation';
import { Plan } from '../models/Plan';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserPlans();
  }, []);

  const loadUserPlans = async () => {
    try {
      setLoading(true);
      const plans = await getUserParticipatingPlans();
      setUserPlans(plans);
    } catch (err) {
      setError(t('profile.errorLoadingPlans'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileInfoContainer}>
        <Image 
          source={{ uri: user?.profileImage || "https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746636109/apenmeet/dljiilozwzcmyinqaaeo.jpg" }} 
          style={styles.profilePicture} 
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.username || "Usuario"}</Text>
          <Text style={[styles.userLocation, { color: theme.text }]}>
            {user?.location?.city && user?.location?.country 
              ? `${user.location.city}, ${user.location.country}`
              : t('profile.noLocation')}
          </Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary }]} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.editButtonText}>{t('profile.editButton')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bioSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.about')}</Text>
        <Text style={[styles.userBio, { color: theme.text }]}>{user?.bio || t('profile.noBio')}</Text>
      </View>

      <View style={styles.interestsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.interests')}</Text>
        <View style={styles.interestsContainer}>
          {user?.interests?.map((interest, index) => (
            <View key={index} style={[styles.interestChip, { backgroundColor: theme.card }]}>
              <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.plansSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.my_plans')}</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : error ? (
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        ) : userPlans.length > 0 ? (
          userPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} navigation={navigation} />
          ))
        ) : (
          <Text style={[styles.noPlansText, { color: theme.text }]}>{t('profile.noPlans')}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileInfoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 16,
    opacity: 0.8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  bioSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 16,
    lineHeight: 24,
  },
  interestsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
  },
  plansSection: {
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
  noPlansText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
}); 