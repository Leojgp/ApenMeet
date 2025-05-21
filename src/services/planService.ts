import api from '../api/config/axiosInstance';
import { 
  getPlanById, 
  getPlans, 
  getPlansByUsername, 
  getUserParticipatingPlans,
  getPlansByLocation
} from '../api/plans/plansApi';
import { Plan, fromApiResponse } from '../models/Plan';
import i18next from 'i18next';

export const fetchPlans = async () => {
  try {
    console.log('Fetching plans...');
    const data = await getPlans();
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid plans data received:', data);
      throw new Error(i18next.t('api.errors.serverError'));
    }

    if (data.length === 0) {
      console.log('No plans found');
      return [];
    }

    const plans = data.map((plan: any) => {
      try {
        return fromApiResponse(plan);
      } catch (error) {
        console.warn('Warning transforming plan:', plan, error);
        return null;
      }
    }).filter(Boolean);
    
    return plans;
  } catch (error: any) {
    console.error('Error in fetchPlans:', error);
    throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
  }
};

export const fetchPlanById = async (planId: string) => {
  try {
    const data = await getPlanById(planId);
    return fromApiResponse(data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
  }
};

export const fetchMyCreatedPlans = async (username: string) => {
  try {
    const data = await getPlansByUsername(username);
    return data.map((plan: any) => fromApiResponse(plan));
  } catch (error: any) {
    throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
  }
};

export const fetchMyJoinedPlans = async () => {
  try {
    const data = await getUserParticipatingPlans();
    return data.map((plan: any) => fromApiResponse(plan));
  } catch (error: any) {
    throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
  }
};

export const fetchPlansByLocation = async (city: string, country: string) => {
  const data = await getPlansByLocation(city, country);
  console.log('Planes recibidos del backend:', data);
  if (!data || !Array.isArray(data)) return [];
  return data.map((plan: any) => fromApiResponse(plan)).filter(Boolean);
};
