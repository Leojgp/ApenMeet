import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';
import { Message } from '../db/models/Message';
import mongoose from 'mongoose';

const jwt = require('jsonwebtoken');

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || '';

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>();

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.use(this.authenticateSocket);
    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  private authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token no proporcionado'));

    jwt.verify(token, JWT_SECRET, (err: Error | null, user: any) => {
      if (err) return next(new Error('Token no válido'));
      (socket as any).user = user;
      next();
    });
  }

  private handleConnection(socket: Socket) {
    const user = (socket as any).user;
    const userId = user._id;
    this.connectedUsers.set(userId, socket.id);

    console.log(`Usuario conectado: ${user.username} (${userId})`);

    socket.on('join-plan', (planId: string) => {
      socket.join(planId);
      console.log(`${user.username} se ha unido al plan ${planId}`);
    });

    socket.on('leave-plan', (planId: string) => {
      socket.leave(planId);
      console.log(`${user.username} ha salido del plan ${planId}`);
    });

    socket.on('send-message', async (data: {
      planId: string;
      content: string;
    }) => {
      console.log('Evento send-message recibido:', data);
      const { planId, content } = data;

      const planObjectId = mongoose.Types.ObjectId.isValid(planId)
        ? new mongoose.Types.ObjectId(planId)
        : null;

      const senderObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;

      if (!senderObjectId || !planObjectId) {
        return socket.emit('error', { message: 'ID no válido' });
      }

      const newMessage = new Message({
        content,
        sender: {
          _id: senderObjectId,
          username: user.username
        },
        planId: planObjectId,
        createdAt: new Date()
      });

      await newMessage.save();

      const messagePayload = {
        _id: newMessage._id,
        content: newMessage.content,
        sender: {
          _id: newMessage.sender._id.toString(),
          username: newMessage.sender.username
        },
        createdAt: newMessage.createdAt
      };

      this.io.to(planId).emit('receive-message', messagePayload);
      socket.emit('message-sent', messagePayload);
    });

    socket.on('disconnect', () => {
      this.connectedUsers.delete(userId);
      console.log('Usuario desconectado:', user.username);
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
