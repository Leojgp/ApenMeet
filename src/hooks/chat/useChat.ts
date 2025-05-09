import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '../../services/websocketService';
import { useUser } from '../user/useUser';

interface ChatUser {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: ChatUser;
  timestamp: string;
}

export const useChat = (planId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const wsService = WebSocketService.getInstance();

  const connect = useCallback(async () => {
    try {
      const socket = await wsService.connect(planId);
      
      socket.on('message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('userJoined', (user: ChatUser) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} joined the chat`,
          sender: { id: 'system', username: 'System' },
          timestamp: new Date().toISOString()
        }]);
      });

      socket.on('userLeft', (user: ChatUser) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} left the chat`,
          sender: { id: 'system', username: 'System' },
          timestamp: new Date().toISOString()
        }]);
      });

      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
    }
  }, [planId]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !user) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: user.id,
        username: user.username
      },
      timestamp: new Date().toISOString()
    };
    
    wsService.sendMessage(message);
    setMessages(prev => [...prev, message]);
  }, [isConnected, user]);

  useEffect(() => {
    if (planId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, planId]);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    user
  };
}; 