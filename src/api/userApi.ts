import axios from 'axios';
import { IP_ADDRESS } from '@env';


const API_URL = `http://${IP_ADDRESS}:3000/api/users`;

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;  
  } catch (error: any){
    throw new Error('Error al realizar login: ' + error.message);
  }
};
