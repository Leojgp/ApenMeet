import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';
import { refreshAccessToken } from '../auth/tokenApi';


const api = axios.create({
    baseURL: `http://${IP_ADDRESS}:3000/api`,
  });

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log('Creando un nuevo accessToken...');
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
