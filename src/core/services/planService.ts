import { getPlanById, getPlans } from '../../api/plans/plansApi';
import { Plan, fromApiResponse } from '../../models/Plan';

export const fetchPlans = async () => {
  try {
    const data = await getPlans();  
    return data.map((plan: any) => fromApiResponse(plan));  
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error desconocido');
  }
};

export const fetchPlanById = async (PlanId:string) => {
    try {
      const data = await getPlanById(PlanId);  
      return fromApiResponse(data);  
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error desconocido');
    }
  };
