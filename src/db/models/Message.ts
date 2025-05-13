import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: {
    _id: Types.ObjectId;
    username: string;
  };
  planId: Types.ObjectId;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  content: { type: String, required: true },
  sender: {
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }
  },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ planId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
