import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
