import * as SecureStore from 'expo-secure-store';
import api from './axiosInstance';


export const refreshAccessToken = async () => {
    const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!storedRefreshToken) throw new Error('No refresh token disponible');
  
    const response = await api.post('users/token', { token: storedRefreshToken });
    const newAccessToken = response.data.accessToken;
  
    await SecureStore.setItemAsync('accessToken', newAccessToken);
  
    return newAccessToken;
  };