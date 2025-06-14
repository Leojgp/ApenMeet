import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '../../services/websocketService';
import { useUser } from '../user/useUser';
import api from '../../api/config/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ChatUser } from '../../models/ChatUser';
import { Message } from '../../models/Message';

export const useChat = (planId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean | undefined>(undefined);
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

  const loadMessages = useCallback(async () => {
    try {
      console.log('Loading messages for plan:', planId);
      const response = await api.get(`/messages/${planId}`);
      console.log('Messages loaded:', response.data);
      const messages = response.data;
      const formattedMessages = messages.map((message: any) => ({
        id: message._id,
        content: message.content,
        sender: {
          _id: message.sender._id || message.sender.id,
          username: message.sender.username
        },
        timestamp: message.createdAt
      }));
      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
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

      await loadMessages();

      console.log('Connecting to WebSocket for plan:', planId);
      const socket = await wsService.connect(planId);
      
      socket.on('receive-message', (message: Message) => {
        console.log('Received message:', message);
        setMessages(prev => {
          const messageExists = prev.some(m => {
            if (m.id && message.id && m.id === message.id) return true;
            
            const timeDiff = Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime());
            return m.content === message.content && 
                   String(m.sender._id) === String(message.sender._id) &&
                   timeDiff < 2000;
          });
          
          if (messageExists) {
            console.log('Message already exists, skipping');
            return prev;
          }

          const newMessage: Message = {
            id: message._id || message.id || `${message.sender._id}-${Date.now()}`,
            content: message.content,
            sender: {
              _id: String(message.sender._id),
              username: message.sender.username
            },
            timestamp: message.createdAt || message.timestamp || new Date().toISOString()
          };

          console.log('Adding new message:', newMessage);
          return [...prev, newMessage];
        });
      });

      socket.on('user-joined', (user: ChatUser) => {
        console.log('User joined:', user);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} joined the chat`,
          sender: { _id: 'system', username: 'System' },
          timestamp: new Date().toISOString()
        }]);
      });

      socket.on('user-left', (user: ChatUser) => {
        console.log('User left:', user);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${user.username} left the chat`,
          sender: { _id: 'system', username: 'System' },
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
  }, [planId, checkParticipation, loadMessages]);

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
        _id: user._id,
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