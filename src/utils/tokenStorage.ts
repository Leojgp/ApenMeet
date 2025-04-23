import * as SecureStore from 'expo-secure-store';

export const saveToken = async (key: 'accessToken' | 'refreshToken', value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getToken = async (key: 'accessToken' | 'refreshToken') => {
  return await SecureStore.getItemAsync(key);
};

export const deleteTokens = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
};
