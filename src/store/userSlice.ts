import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../models/User';

type UserState = User;

const initialState: UserState = {
  username: '',
  email: '',
  bio: '',
  location: { city: '', coordinates: [0, 0] },
  interests: [],
  profileImage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return { ...state, ...action.payload };
    },
    clearUser() {
      return initialState;
    },
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer; 