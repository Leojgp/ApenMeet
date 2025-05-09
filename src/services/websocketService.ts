import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';

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

class WebSocketService {
  private socket: ReturnType<typeof io> | null = null;
  private static instance: WebSocketService;
  private planId: string = '';

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(planId: string): Promise<ReturnType<typeof io>> {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) throw new Error('No authentication token found');

      this.socket = io(`http://${IP_ADDRESS}:3000`, {
        auth: {
          token
        },
        query: {
          planId
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
      });

      this.socket.on('error', (error: { message: string }) => {
        console.error('WebSocket error:', error.message);
      });

      return this.socket;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.socket) {
      this.socket.emit('message', message);
    }
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  onUserJoined(callback: (user: ChatUser) => void): void {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback: (user: ChatUser) => void): void {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  onError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
}

export default WebSocketService; 