import { useState, useEffect, useCallback } from 'react';
import api from '../../api/config/axiosInstance';
import { Plan } from '../../models/Plan';

export const useParticipatingPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipatingPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('plans/participating');
      setPlans(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipatingPlans();
  }, [fetchParticipatingPlans]);

  return { plans, loading, error, refresh: fetchParticipatingPlans };
}; 