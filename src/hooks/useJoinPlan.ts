import { useState } from 'react';
import { joinPlan } from '../api/plansApi';


export function useJoinPlan() {
  const [loadingPlan, setLoadingPlans] = useState(false);
  const [PlanErrors, setPlanErrors] = useState<string | null>(null);

  const join = async (planId: string) => {
    setLoadingPlans(true);
    setPlanErrors(null);
    try {
      const result = await joinPlan(planId);
      return result;
    } catch (err: any) {
      setPlanErrors(err.message);
      return null;
    } finally {
      setLoadingPlans(false);
    }
  };

  return { join, loadingPlan, PlanErrors };
}
