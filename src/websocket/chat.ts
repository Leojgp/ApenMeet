import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || '';

export class SocketServer {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.use(this.authenticateSocket);

    this.io.on('connection', (socket) => {
      const user = (socket as any).user;
      console.log('Usuario conectado por WebSocket:', user);

      socket.on('mensaje', (data) => {
        console.log(`Mensaje recibido de ${user.username}:`, data);
        socket.emit('respuesta', { mensaje: 'Hola desde el servidor WebSocket' });
      });

      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', user.username);
      });
    });
  }

  private authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    console.log('Token recibido:', token); 
  
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }
  
    jwt.verify(token, JWT_SECRET, (err:Error, user:any) => {
      if (err) {
        console.error('Error de verificación del token:', err);
        return next(new Error('Token no válido'));
      }
  
      (socket as any).user = user;
      console.log('Token verificado:', user); 
      next();
    });
  }
  

  public getIO(): SocketIOServer {
    return this.io;
  }
}
