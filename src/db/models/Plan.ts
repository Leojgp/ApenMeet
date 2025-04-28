import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  title: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  imageUrl: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  tags: string[];
  dateTime: Date;
  maxParticipants: number;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  origin: string;
  createdAt: Date;
  status: string;
}

const PlanSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: {
    type: String,
    default: 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg'
  },
  location: {
    address: { type: String, required: true },
    coordinates: { type: [Number], index: '2dsphere', required: true },
  },
  tags: [{ type: String }],
  dateTime: { type: Date, required: true },
  maxParticipants: { type: Number, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  origin: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'open' },
});

PlanSchema.index({ creatorId: 1 });
PlanSchema.index({ dateTime: 1 });
PlanSchema.index({ tags: 1 });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);