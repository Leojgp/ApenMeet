import { useState } from 'react';
import { loginUser } from '../api/userApi';
import { saveToken } from '../utils/tokenStorage';

interface useAuthProps {
    navigation: any
}

export const useAuth = ({ navigation }: useAuthProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (email: string, password: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(email, password);
            console.log('Login exitoso:', response);
            await saveToken('accessToken', response.accessToken);
            await saveToken('refreshToken', response.refreshToken);
            navigation.navigate('main');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
            console.log('Error en login:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return { handleSubmit, loading, error };
};
