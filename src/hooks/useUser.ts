import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';
import { getCurrentUser } from '../api/userApi';
import { RootState } from '../store';

export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const loadUserData = async () => {
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
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [dispatch]);

  return { user };
};
