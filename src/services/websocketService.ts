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
  private currentPlanId: string = '';

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(planId: string): Promise<ReturnType<typeof io>> {
    try {
      console.log('Attempting to connect to WebSocket...');
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) throw new Error('No authentication token found');

      this.currentPlanId = planId;
      const WS_URL = `http://${IP_ADDRESS}:3000`;
      console.log('Connecting to:', WS_URL);
      
      if (this.socket) {
        console.log('Disconnecting existing socket...');
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(WS_URL, {
        auth: {
          token
        },
        query: {
          planId
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Successfully connected to WebSocket server');
        console.log('Socket ID:', this.socket?.id);
        this.socket?.emit('join-plan', this.currentPlanId);
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
        console.log('Connection state:', this.socket?.connected ? 'connected' : 'disconnected');
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
          console.log('Attempting to reconnect in 2 seconds...');
          setTimeout(() => this.connect(this.currentPlanId), 2000);
        }
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from WebSocket:', reason);
        if (this.socket) {
          this.socket.emit('leave-plan', this.currentPlanId);
        }
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
      console.log('Disconnecting WebSocket...');
      this.socket.emit('leave-plan', this.currentPlanId);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.socket && this.socket.connected) {
      console.log('Sending message to server:', message);
      console.log('Current plan ID:', this.currentPlanId);
      this.socket.emit('send-message', {
        planId: this.currentPlanId,
        content: message.content
      }, (response: any) => {
        if (response && response.error) {
          console.error('Error sending message:', response.error);
        } else {
          console.log('Message sent successfully:', response);
        }
      });
    } else {
      console.error('Cannot send message: Socket not connected');
      if (this.socket) {
        console.log('Attempting to reconnect socket...');
        this.socket.connect();
      }
    }
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onUserJoined(callback: (user: ChatUser) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (user: ChatUser) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
}

export default WebSocketService; 