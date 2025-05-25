import { IP_ADDRESS } from '@env';
import { User } from '../../models/User';

export const loginWithGoogle = async (accessToken: string): Promise<User> => {
  try {
    const response = await fetch(`${IP_ADDRESS}/users/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to login with Google');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error in loginWithGoogle:', error);
    throw error;
  }
}; 