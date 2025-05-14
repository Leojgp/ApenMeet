import { getPlanById, getPlans } from '../../api/plans/plansApi';
import { Plan, fromApiResponse } from '../../models/Plan';
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

export const fetchPlanById = async (PlanId:string) => {
    try {
      const data = await getPlanById(PlanId);  
      return fromApiResponse(data);  
    } catch (error: any) {
      throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
    }
  };
