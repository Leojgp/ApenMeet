import i18next from 'i18next';

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.response?.data?.error || i18next.t('api.errors.serverError'));
}; 