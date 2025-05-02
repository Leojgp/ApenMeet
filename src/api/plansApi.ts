import api from './axiosInstance';

export const getPlans = async () => {
    try {
        const response = await api.get(`plans`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al obtener los planes: ' + error.message);
          }
    }
};

export const getPlanById = async (planId: string) => {
    try {
        const response = await api.get(`plans/${planId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al obtener los planes: ' + error.message);
          }
    }
};


export const joinPlan = async (planId: string) => {
    try{
        console.log(planId)
        const response = await api.post(`plans/${planId}/join`);
        return response.data;
    }catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al unirse al Plan: ' + error.message);
          }
    }
}

export const createPlan = async (plan: any) => {
    try {
        const response = await api.post('plans', plan, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
        } else {
            throw new Error('Error al crear el plan: ' + error.message);
        }
    }
};