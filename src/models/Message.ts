import { ChatUser } from './ChatUser';

export interface Message {
  id: string;
  _id?: string;
  content: string;
  sender: ChatUser;
  senderId?: string;
  timestamp: string;
  createdAt?: string;
} 