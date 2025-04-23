import api from './axiosInstance';


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await api.post(`users/login`, { email, password });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al realizar login: ' + error.message);
          }
    }
};

export const getCurrentUser  = async () => {
  try {
  const response = await api.get(`/users/me`);
  return response.data;
} catch (error: any) {
  if (error.response) {
      throw new Error(error.response.data.message || 'Error desconocido');
    } else {
      throw new Error('Error al obtener datos del usuario ' + error.message);
    }
}
};

