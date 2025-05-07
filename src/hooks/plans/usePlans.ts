import { useState, useEffect, useCallback } from 'react';
import { Plan } from '../../models/Plan';
import { fetchPlans } from '../../core/services/planService';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlansData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPlans();  
      setPlans(data); 
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlansData();
  }, [fetchPlansData]);

  return { plans, loading, error, refresh: fetchPlansData };
};
