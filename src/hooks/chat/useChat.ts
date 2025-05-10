import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '../../services/websocketService';
import { useUser } from '../user/useUser';
import api from '../../api/config/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ChatUser {
  id: string;
  _id: string;
  username: string;
}

interface Message {
  id: string;
  _id?: string;
  content: string;
  sender: ChatUser;
  senderId?: string;
  timestamp: string;
  createdAt?: string;
}

export const useChat = (planId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const { user } = useUser();
  const wsService = WebSocketService.getInstance();
  const currentUser = useSelector((state: RootState) => state.user);

  const checkParticipation = useCallback(async () => {
    try {
      console.log('Checking participation for plan:', planId);
      const response = await api.get('plans/participating');
      const participatingPlans = response.data;
      const isParticipating = participatingPlans.some((plan: any) => plan._id === planId);
      console.log('Is participating:', isParticipating);
      setIsParticipant(isParticipating);
      return isParticipating;
    } catch (err) {
      console.error('Error checking participation:', err);
      setIsParticipant(false);
      return false;
    }
  }, [planId]);

  const connect = useCallback(async () => {
    try {
      const isParticipating = await checkParticipation();
      if (!isParticipating) {
        console.log('User is not a participant of this plan');
        setIsConnected(false);
        return;
      }

      console.log('Connecting to WebSocket for plan:', planId);
      const socket = await wsService.connect(planId);
      
      socket.on('receive-message', (message: Message) => {
        console.log('Received message:', message);
        setMessages(prev => {
          // Verificar si el mensaje ya existe
          const messageExists = prev.some(m => 
            m.id === message._id || 
            m.id === message.id || 
            (m.content === message.content && m.sender.id === message.senderId)
          );
          
          if (messageExists) {
            console.log('Message already exists, skipping...');
            return prev;
          }

          return [...prev, {
            id: message._id || message.id,
            content: message.content,
            sender: {
              id: message.senderId || message.sender.id,
              _id: message.senderId || message.sender._id,
              username: message.sender?.username || currentUser.username || 'Usuario'
            },
            timestamp: message.createdAt || message.timestamp
          }];
        });
      });

      socket.on('user-joined', (user: ChatUser) => {
        console.log('User joined:', user);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} joined the chat`,
          sender: { id: 'system', _id: 'system', username: 'System' },
          timestamp: new Date().toISOString()
        }]);
      });

      socket.on('user-left', (user: ChatUser) => {
        console.log('User left:', user);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} left the chat`,
          sender: { id: 'system', _id: 'system', username: 'System' },
          timestamp: new Date().toISOString()
        }]);
      });

      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      console.error('Error connecting to chat:', err);
      setError(err.message);
      setIsConnected(false);
    }
  }, [planId, checkParticipation]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !user || !isParticipant) {
      console.log('Cannot send message:', { isConnected, hasUser: !!user, isParticipant });
      return;
    }
    
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: user.id,
        _id: user.id,
        username: user.username
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending message:', message);
    wsService.sendMessage(message);
  }, [isConnected, user, isParticipant]);

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
    user,
    isParticipant
  };
}; 