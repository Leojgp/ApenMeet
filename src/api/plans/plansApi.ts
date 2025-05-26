import api from '../config/axiosInstance';
import i18next from 'i18next';
import { handleApiError } from '../utils/errorHandler';

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

export const getPlansByUsername = async (username: string) => {
    try {
        const response = await api.get(`plans/user/${username}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const getUserParticipatingPlans = async (userId?: string) => {
    try {
        const endpoint = userId ? `/plans/user/${userId}` : '/plans/participating';
        console.log('Endpoint being passed to api.get:', endpoint);
        console.log('Full URL Axios will attempt:', api.defaults.baseURL + endpoint);
        const response = await api.get(endpoint);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user plans:', error); 
        if (error.response) {
            throw new Error(error.response.data.message || 'Error fetching user plans: ' + error.message);
        } else {
            throw new Error('Error fetching user plans: ' + error.message);
        }
    }
};

export const joinPlan = async (planId: string) => {
    try {
        const response = await api.post(`plans/${planId}/join`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

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

export const getMyCreatedPlans = async () => {
    try {
        const response = await api.get('plans/created');
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const getMyJoinedPlans = async () => {
    try {
        const response = await api.get('plans/joined');
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const getMySavedPlans = async () => {
    try {
        const response = await api.get('plans/saved');
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const savePlan = async (planId: string) => {
    try {
        const response = await api.post(`plans/${planId}/save`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const unsavePlan = async (planId: string) => {
    try {
        const response = await api.delete(`plans/${planId}/save`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || i18next.t('api.errors.serverError'));
        } else {
            throw new Error(i18next.t('api.errors.serverError'));
        }
    }
};

export const addAdmin = async (planId: string, userId: string) => {
    if (!planId || !userId) {
      throw new Error('Invalid plan ID or user ID');
    }
    const res = await api.post(`/plans/${planId}/admins/${userId}`);
    return res.data;
  };
  export const removeAdmin = async (planId: string, userId: string) => {
    if (!planId || !userId) {
      throw new Error('Invalid plan ID or user ID');
    }
    const res = await api.delete(`/plans/${planId}/admins/${userId}`);
    return res.data;
  };
  export const leavePlan = async (planId: string, userId: string) => {
    if (!planId || !userId) {
      throw new Error('Invalid plan ID or user ID');
    }
    const res = await api.post(`/plans/${planId}/leave`, { userId });
    return res.data;
  };

export const getPlansByLocation = async (city: string, country: string) => {
  console.log('FRONTEND LOG - city:', city, 'country:', country);
  try {
    const response = await api.get(`/plans/location`, { params: { city, country } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const removeParticipant = async (planId: string, participantUserId: string) => {
    try {
        const response = await api.delete(`plans/${planId}/participants/${participantUserId}/remove`);
        return response.data;
    } catch (error: any) {
        return handleApiError(error);
    }
};