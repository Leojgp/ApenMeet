import api from '../config/axiosInstance';
import { User } from '../../models/User';

export const loginWithGoogle = async (accessToken: string) => {
  try {
    console.log('Enviando access token al backend:', accessToken);
    const response = await api.post('users/auth/google', { 
      accessToken 
    });
    console.log('Respuesta del backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error detallado:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Error en la autenticación con Google');
  }
};
