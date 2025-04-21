import { loginUser } from '../../api/userApi';

export const login = async (email: string, password: string) => {
  try {
    const data = await loginUser(email, password);
    return data; 
  } catch (error: any) {
    throw new Error(error.message);
  }
};
