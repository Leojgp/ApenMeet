import { useState } from 'react';
import { loginUser } from '../api/userApi';

interface useAuthProps{
navigation: any
}

export const useAuth = ({navigation}: useAuthProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(email, password);
      console.log('Login exitoso:', response);
      navigation.navigate('main');
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || 'Ocurrió un error. Intenta nuevamente.');
      console.log('Error en login:', apiMessage || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading, error };
};
