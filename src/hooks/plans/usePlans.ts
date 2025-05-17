import { useState, useCallback } from 'react';
import { Plan } from '../../models/Plan';
import { 
  fetchPlans, 
  fetchPlanById, 
  fetchMyCreatedPlans, 
  fetchMyJoinedPlans
} from '../../services/planService';
import { useUser } from '../user/useUser';

export const usePlans = () => {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myCreatedPlans, setMyCreatedPlans] = useState<Plan[]>([]);
  const [myJoinedPlans, setMyJoinedPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allPlans, created, joined] = await Promise.all([
        fetchPlans(),
        user ? fetchMyCreatedPlans(user.username) : [],
        fetchMyJoinedPlans()
      ]);
      setPlans(allPlans.filter((plan: Plan | null): plan is Plan => plan !== null));
      setMyCreatedPlans(created.filter((plan: Plan | null): plan is Plan => plan !== null));
      setMyJoinedPlans(joined.filter((plan: Plan | null): plan is Plan => plan !== null));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPlan = useCallback(async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlanById(planId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plans,
    myCreatedPlans,
    myJoinedPlans,
    loading,
    error,
    refresh,
    fetchPlan
  };
};
