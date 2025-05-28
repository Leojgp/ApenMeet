import api from '../api/config/axiosInstance';
import { 
  getPlanById, 
  getPlans, 
  getPlansByUsername, 
  getUserParticipatingPlans as apiGetUserParticipatingPlans,
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
    console.log(`[FRONTEND] fetchMyCreatedPlans called for username: ${username}`);
    const response = await api.get(`plans/created-by/${username}`);
    return response.data.map((plan: any) => fromApiResponse(plan));
  } catch (error: any) {
    console.error('Error fetching created plans:', error);
    throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
  }
};

export const fetchMyJoinedPlans = async (userId?: string) => {
  try {
    const endpoint = userId ? `/user/${userId}` : '/plans/participating';
    console.log('Endpoint being passed to api.get:', endpoint);
    console.log('Full URL Axios will attempt:', api.defaults.baseURL + endpoint);
    const response = await api.get(endpoint);
    return response.data.map((plan: any) => fromApiResponse(plan));
  } catch (error: any) {
    console.error('Error fetching user plans:', error); 
    if (error.response) {
      throw new Error(error.response.data.message || 'Error fetching user plans: ' + error.message);
    } else {
      throw new Error('Error fetching user plans: ' + error.message);
    }
  }
};

export const fetchPlansByLocation = async (city: string, country: string) => {
  const data = await getPlansByLocation(city, country);
  console.log('Planes recibidos del backend:', data);
  if (!data || !Array.isArray(data)) return [];
  return data.map((plan: any) => fromApiResponse(plan)).filter(Boolean);
};
