import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/userSlice';
import { getCurrentUser } from '../../api/user/userApi';
import { RootState } from '../../store';
import { User } from '../../models/User';

export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const isInitialized = useRef(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (isInitialized.current) return;
      
      try {
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
        isInitialized.current = true;
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [dispatch]);

  return { user };
};
