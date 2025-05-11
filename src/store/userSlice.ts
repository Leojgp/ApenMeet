import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../models/User';


type UserState = User;

const initialState: UserState = {
  _id: '',
  username: '',
  email: '',
  bio: '',
  location: {
    city: '',
    country: '',
    coordinates: [0, 0],
    formattedAddress: '',
    postalCode: '',
    region: '',
    timezone: ''
  },
  interests: [],
  profileImage: '',
  rating: 0,
  joinedAt: '',
  isVerified: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    clearUser: () => initialState,
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer; 