import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
    formattedAddress: string;
    postalCode?: string;
    region?: string;
    timezone?: string;
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
    country: { type: String },
    coordinates: { type: [Number], index: '2dsphere' },
    formattedAddress: { type: String, default: '' },
    postalCode: { type: String },
    region: { type: String },
    timezone: { type: String }
  },
  interests: [{ type: String }],
  profileImage: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
});

export const User = mongoose.model<IUser>('User', UserSchema);