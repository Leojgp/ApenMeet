import { useState } from 'react';
import { createPlan } from '../../api';
import { useTranslation } from 'react-i18next';
import { errorMapping } from '../../utils/errorMapping';

export function useCreatePlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const create = async (plan: any) => {
    setError('');
    setLoading(true);
    try {
      await createPlan(plan);
      return true;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message;
      const translationKey = errorMapping[errorMessage] || 'api.errors.serverError';
      setError(t(translationKey));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
} 