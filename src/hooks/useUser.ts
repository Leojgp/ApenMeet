import { useEffect, useState } from 'react';
import { getCurrentUser  } from '../api/userApi';

export const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCurrentUser ();
        setUser(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener el usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};
