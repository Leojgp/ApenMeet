import api from './axiosInstance';


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

export const registerUser = async (username: string, email: string, password: string, city: string, interests: string[]) => {
    try {
        const response = await api.post('users/register', {
            username,
            email,
            password,
            location: { city, coordinates: [0, 0] },
            interests
        });
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
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error desconocido');
        } else {
            throw new Error('Error al actualizar usuario: ' + error.message);
        }
    }
};

