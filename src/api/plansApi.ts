import api from './axiosInstance';

export const getPlans = async () => {
    try {
        const response = await api.get(`plans`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al realizar login: ' + error.message);
          }
    }
};