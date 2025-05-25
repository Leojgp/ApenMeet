import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import { loginWithGoogle } from '../../api/auth/authApi';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens?.accessToken) {
        const userData = await loginWithGoogle(tokens.accessToken);
        dispatch(setUser(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during Google login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isLoading,
  };
}; 