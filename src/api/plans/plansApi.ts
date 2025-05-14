import api from '../config/axiosInstance';
import i18next from 'i18next';

export const getPlans = async () => {
    try {
        const response = await api.get(`plans`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const getPlanById = async (planId: string) => {
    try {
        const response = await api.get(`plans/${planId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const joinPlan = async (planId: string) => {
    try {
        console.log(planId)
        const response = await api.post(`plans/${planId}/join`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
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
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
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
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error(i18next.t('api.errors.serverError'));
        } else {
            console.error('Request setup error:', error.message);
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const deletePlan = async (planId: string) => {
    try {
        const response = await api.delete(`plans/${planId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};