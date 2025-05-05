import { useState, useEffect } from 'react';
import { Plan } from '../models/Plan';
import { fetchPlans } from '../core/services/planService';


export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        const data = await fetchPlans();  
        setPlans(data); 
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlansData();
  }, []);

  return { plans, loading, error };
};
