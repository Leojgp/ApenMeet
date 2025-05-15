import { useState, useEffect, useRef, useCallback } from 'react';
import { Plan } from '../../models/Plan';
import { fetchPlanById } from '../../core/services/planService'; 

export const usePlansById = (planId: string) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousParticipants = useRef<string[]>([]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlanById(planId);
      setPlan(data);
      previousParticipants.current = data.participants.map((p: any) => p._id);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { plan, loading, error, refetch };
};
