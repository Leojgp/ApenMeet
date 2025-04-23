import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';

const instance = axios.create({
  baseURL: `http://${IP_ADDRESS}:3000/api`,
});

instance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
