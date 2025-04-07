import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  location: {
    city: string;
    coordinates: [number, number];
  };
  interests: string[];
  profileImage: string;
  rating: number;
  joinedAt: Date;
  isVerified: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  location: {
    city: { type: String, default: '' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  interests: [{ type: String }],
  profileImage: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
});


export const User = mongoose.model<IUser>('User', UserSchema);