import api from '../config/axiosInstance';

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

export const editPlan = async (planId: string, planData: FormData): Promise<any> => {
    try {
        const response = await api.put(`plans/${planId}`, planData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            transformRequest: (data, headers) => {
                return data;
            },
            timeout: 30000,
        });
        return response.data;
    } catch (error: any) {
        console.error('Error in editPlan:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Error al editar el plan');
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No se recibió respuesta del servidor. Por favor, verifica tu conexión.');
        } else {
            console.error('Request setup error:', error.message);
            throw new Error('Error al configurar la petición: ' + error.message);
        }
    }
};

export const deletePlan = async (planId: string) => {
    try {
        const response = await api.delete(`plans/${planId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
        } else {
            throw new Error('Error al eliminar el plan: ' + error.message);
        }
    }
};