import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  title: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  creatorUsername?: string;
  imageUrl: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  tags: string[];
  dateTime: Date;
  maxParticipants: number;
  participants: {
    id: mongoose.Types.ObjectId;
    username: string;
  }[];
  admins: {
    id: mongoose.Types.ObjectId;
    username: string;
  }[];
  origin: string;
  createdAt: Date;
  status: string;
}

const PlanSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorUsername: { type: String },
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
  participants: [{
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String }
  }],
  admins: [{
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String }
  }],
  origin: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'open' },
});

PlanSchema.index({ creatorId: 1 });
PlanSchema.index({ dateTime: 1 });
PlanSchema.index({ tags: 1 });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);