import { useState, useEffect, useRef } from 'react';
import { Plan } from '../../models/Plan';
import { fetchPlanById } from '../../core/services/planService'; 

export const usePlansById = (planId: string) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousParticipants = useRef<string[]>([]);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const data = await fetchPlanById(planId);
        
        const currentParticipants = data.participants.map((p: any) => p._id).sort().join(',');
        const prevParticipants = previousParticipants.current.sort().join(',');
        
        if (currentParticipants !== prevParticipants) {
          setPlan(data);
          previousParticipants.current = data.participants.map((p: any) => p._id);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [planId]);

  return { plan, loading, error };
};
