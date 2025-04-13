import mongoose, { Schema, Document } from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();
export interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: process.env.REFRESH_TOKEN_EXPIRATION}, 
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
