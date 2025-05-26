import api from '../config/axiosInstance';


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await api.post(`users/login`, { email, password });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
          } else {
            throw new Error('Error al realizar login: ' + error.message);
          }
    }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('users/me');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error desconocido');
    } else {
      throw new Error('Error al obtener datos del usuario: ' + error.message);
    }
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`users/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error desconocido');
    } else {
      throw new Error('Error al obtener datos del usuario: ' + error.message);
    }
  }
};

export const registerUser = async (userData: any) => {
    try {
        const response = await api.post('users/register', userData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
        } else {
            throw new Error('Error al registrar usuario: ' + error.message);
        }
    }
};

export const updateUser = async (formData: FormData) => {
    try {
        const response = await api.patch('users/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Response from update user:', response.data); // Para debugging
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Error response:', error.response.data); // Para debugging
            throw new Error(error.response.data.message || 'Error desconocido');
        } else {
            throw new Error('Error al actualizar usuario: ' + error.message);
        }
    }
};

