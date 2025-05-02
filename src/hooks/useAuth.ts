import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';

interface useAuthProps {
    navigation: any
}

export const useAuth = ({ navigation }: useAuthProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const nav = useNavigation();

    const handleRegister = async (formData: FormData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }

            if (navigation) {
                navigation.navigate('SignIn');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // Guardar tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            if (navigation) {
                navigation.navigate('Home');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return {
        handleRegister,
        handleLogin,
        loading,
        error,
    };
};
