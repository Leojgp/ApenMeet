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

      const data = await getCurrentUser();
      dispatch(setUser({
        _id: data.user._id || data.user.id,
        username: data.user.username,
        email: data.user.email,
        bio: data.user.bio || '',
        location: data.user.location || { city: '', country: '', coordinates: [0, 0], formattedAddress: '', postalCode: '', region: '', timezone: '' },
        interests: data.user.interests || [],
        profileImage: data.user.profileImage || '',
        rating: data.user.rating || 0,
        joinedAt: data.user.joinedAt || '',
        isVerified: data.user.isVerified || false
      }));
      lastTokenRef.current = currentToken;
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
