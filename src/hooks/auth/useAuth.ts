import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { loginUser, registerUser } from '../../api/user/userApi';
import { saveToken } from '../../utils/tokenStorage';
import { getCurrentUser } from '../../api/user/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import React from 'react';

interface useAuthProps {
    navigation: any
}

export const useAuth = ({ navigation }: useAuthProps) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const nav = useNavigation();
    const dispatch = useDispatch();

    const handleRegister = async (formData: any) => {
        try {
            setLoading(true);
            setError(null);

            const username = formData.username;
            const email = formData.email;
            const password = formData.password;
            const interests = formData.interests;
            const interestsArray = interests ? interests.split(',').map((i: string) => i.trim()) : [];

            await registerUser(formData);

            if (navigation) {
                navigation.navigate('SignIn');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string, googleAccessToken?: string) => {

        setLoading(true);
        setError('');

        try {
            const response = await loginUser(email, password, googleAccessToken);
            await saveToken('accessToken', response.accessToken);
            await saveToken('refreshToken', response.refreshToken);

            const userData = await getCurrentUser();
            dispatch(setUser({
                _id: userData.user._id || userData.user.id,
                username: userData.user.username,
                email: userData.user.email,
                bio: userData.user.bio || '',
                location: userData.user.location || { city: '', country: '', coordinates: [0, 0], formattedAddress: '', postalCode: '', region: '', timezone: '' },
                interests: userData.user.interests || [],
                profileImage: userData.user.profileImage || '',
                rating: userData.user.rating || 0,
                joinedAt: userData.user.joinedAt || '',
                isVerified: userData.user.isVerified || false,
                authProvider: userData.user.authProvider || 'local'
            }));

            console.log('useAuth: Navegando a Tabs');
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tabs' }],
                });
            }
        } catch (err: any) {
            console.error('useAuth: Error en login:', err);
            setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
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
