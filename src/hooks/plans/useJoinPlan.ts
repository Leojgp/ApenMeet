import { useState } from 'react';
import { joinPlan } from '../../api';
import { useTranslation } from 'react-i18next';
import { errorMapping } from '../../utils/errorMapping';

export function useJoinPlan() {
  const [loadingPlan, setLoadingPlans] = useState(false);
  const [PlanErrors, setPlanErrors] = useState<string | null>(null);
  const { t } = useTranslation();

  const join = async (planId: string) => {
    setLoadingPlans(true);
    setPlanErrors(null);
    try {
      const result = await joinPlan(planId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      const translationKey = errorMapping[errorMessage] || 'api.errors.serverError';
      setPlanErrors(t(translationKey));
      return null;
    } finally {
      setLoadingPlans(false);
    }
  };

  return { join, loadingPlan, PlanErrors };
}
