import { Server, Socket } from 'socket.io';
import { Plan } from '../db/models/Plan';
import { User } from '../db/models/User';
import dotenv from 'dotenv';

dotenv.config();
const jwt = require('jsonwebtoken');

interface ChatUser {
  _id: string;
  username: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: ChatUser;
  timestamp: string;
}

export const handleChatConnection = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.error('No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as any;
      console.log('Decoded token:', decoded);

      const user = await User.findById(decoded._id) as { _id: any; username: string };
      if (!user) {
        console.error('User not found for ID:', decoded._id);
        return next(new Error('Authentication error: User not found'));
      }

      console.log('Authenticated user:', user.username);
      socket.data.user = {
        _id: user._id.toString(),
        username: user.username
      };
      
      next();
    } catch (error: any) {
      console.error('Authentication error:', error);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const planId = socket.handshake.query.planId as string;
    const user = socket.data.user as ChatUser;

    console.log('New connection attempt:', { planId, user });

    if (!planId) {
      console.error('No planId provided');
      socket.disconnect();
      return;
    }

    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        console.error('Plan not found:', planId);
        socket.disconnect();
        return;
      }

      console.log('Found plan:', { 
        id: plan._id, 
        creator: plan.creatorId, 
        participants: plan.participants 
      });

      const isParticipant = plan.participants.some(p => p.toString() === user._id) || 
                          plan.creatorId.toString() === user._id;

      console.log('Is participant:', isParticipant);

      if (!isParticipant) {
        console.error('User is not a participant:', user._id);
        socket.disconnect();
        return;
      }

      socket.join(planId);
      console.log('User joined room:', planId);

      socket.to(planId).emit('userJoined', user);

      socket.on('message', async (message: ChatMessage) => {
        console.log('Server received message:', {
          from: user.username,
          content: message.content,
          planId,
          timestamp: new Date().toISOString()
        });

        if (!isParticipant) {
          console.error('Non-participant tried to send message');
          return;
        }

        const timestamp = new Date().toISOString();
        const messageWithTimestamp = {
          ...message,
          timestamp,
          sender: user
        };

        console.log('Broadcasting message to room:', {
          room: planId,
          message: messageWithTimestamp
        });

        io.to(planId).emit('message', messageWithTimestamp);
        console.log('Message broadcast complete');
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', user.username);
        socket.to(planId).emit('userLeft', user);
      });

    } catch (error) {
      console.error('Error in chat connection:', error);
      socket.disconnect();
    }
  });
}; 