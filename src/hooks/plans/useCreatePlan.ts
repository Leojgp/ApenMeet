import { useState } from 'react';
import { createPlan as createPlanService } from '../api/plansApi';

export function useCreatePlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const create = async (plan: any) => {
    setError('');
    setLoading(true);
    try {
      await createPlanService(plan);
      return true;
    } catch (e: any) {
      setError(e.message || 'Error creating plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
} 