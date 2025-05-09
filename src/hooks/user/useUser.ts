import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../../store/userSlice';
import { getCurrentUser } from '../../api/user/userApi';
import { RootState } from '../../store';
import { User } from '../../models/User';
import * as SecureStore from 'expo-secure-store';

export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const lastTokenRef = useRef<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const currentToken = await SecureStore.getItemAsync('accessToken');
      
      if (!currentToken) {
        dispatch(clearUser());
        return;
      }

      if (currentToken !== lastTokenRef.current) {
        lastTokenRef.current = currentToken;
        const data = await getCurrentUser();
        dispatch(setUser({
          id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email,
          bio: data.user.bio || '',
          location: data.user.location || { city: '', coordinates: [0, 0] },
          interests: data.user.interests || [],
          profileImage: data.user.profileImage || null,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return { user, refreshUser: loadUserData };
};
