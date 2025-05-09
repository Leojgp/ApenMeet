import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { loginUser, registerUser } from '../../api/user/userApi';
import { saveToken } from '../../utils/tokenStorage';
import { getCurrentUser } from '../../api/user/userApi';

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

            const username = formData.get('username') as string;
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            const location = formData.get('location') as string;
            const interests = formData.get('interests') as string;
            const city = location ? JSON.parse(location).city : '';
            const interestsArray = interests ? interests.split(',').map(i => i.trim()) : [];

            await registerUser(username, email, password, city, interestsArray);

            if (navigation) {
                navigation.navigate('SignIn');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(email, password);
            await saveToken('accessToken', response.accessToken);
            await saveToken('refreshToken', response.refreshToken);

            const userData = await getCurrentUser();
            navigation.navigate('Main');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
            console.log('Error en login:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleRegister,
        handleLogin,
        loading,
        error
    };
};
