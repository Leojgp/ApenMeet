import api from '../api/config/axiosInstance';

export const planService = {
  addAdmin: async (planId: string, userId: string) => {
    if (!planId || !userId) {
      throw new Error('Invalid plan ID or user ID');
    }
    const res = await api.post(`/plans/${planId}/admins/${userId}`);
    return res.data;
  },
  removeAdmin: async (planId: string, userId: string) => {
    if (!planId || !userId) {
      throw new Error('Invalid plan ID or user ID');
    }
    const res = await api.delete(`/plans/${planId}/admins/${userId}`);
    return res.data;
  },
}; 