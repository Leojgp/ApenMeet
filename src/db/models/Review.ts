import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ userId: 1, createdAt: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
