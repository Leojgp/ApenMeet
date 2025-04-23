import { getPlanById, getPlans } from '../../api/plansApi';
import { Plan } from '../../entities/Plan';



export const fetchPlans = async () => {
  try {
    const data = await getPlans();  
    return data.map((plan: any) => Plan.fromApiResponse(plan));  
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error desconocido');
  }
};

export const fetchPlanById = async (PlanId:string) => {
    try {
      const data = await getPlanById(PlanId);  
      return Plan.fromApiResponse(data);  
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error desconocido');
    }
  };
