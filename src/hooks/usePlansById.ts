import { useState, useEffect } from 'react';
import { Plan } from '../entities/Plan';
import { fetchPlanById } from '../core/services/planService'; 

export const usePlansById = (planId: string) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const data = await fetchPlanById(planId); 
        setPlan(data); 
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlanData(); 

  }, [plan?.participants]); 

  return { plan, loading, error };
};
