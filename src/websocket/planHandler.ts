import { Server, Socket } from 'socket.io';
import { Plan } from '../db/models/Plan';
import { User } from '../db/models/User';
import dotenv from 'dotenv';

dotenv.config();
const jwt = require('jsonwebtoken');

interface PlanUser {
  _id: string;
  username: string;
}

export const handlePlanConnection = (io: Server) => {
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
    const user = socket.data.user as PlanUser;
    console.log('New plan connection:', user.username);

    socket.on('join-plan', async (planId: string) => {
      try {
        const plan = await Plan.findById(planId);
        if (!plan) {
          console.error('Plan not found:', planId);
          socket.emit('error', { message: 'Plan not found' });
          return;
        }

        const isParticipant = plan.participants.some(p => p.toString() === user._id) || 
                            plan.creatorId.toString() === user._id;

        if (!isParticipant) {
          console.error('User is not a participant:', user._id);
          socket.emit('error', { message: 'Not authorized to join this plan' });
          return;
        }

        socket.join(planId);
        console.log('User joined plan:', planId);
        socket.to(planId).emit('userJoined', user);
      } catch (error) {
        console.error('Error joining plan:', error);
        socket.emit('error', { message: 'Error joining plan' });
      }
    });

    socket.on('leave-plan', (planId: string) => {
      socket.leave(planId);
      console.log('User left plan:', planId);
      socket.to(planId).emit('userLeft', user);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', user.username);
    });
  });
}; 