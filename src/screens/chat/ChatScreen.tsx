import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../hooks/chat/useChat';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useUser } from '../../hooks/user/useUser';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface ChatUser {
  id: string;
  _id?: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: ChatUser;
  timestamp: string;
}

type RootStackParamList = {
  Chat: { planId?: string; planTitle?: string };
  Plans: undefined;
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { planId, planTitle } = route.params || {};
  const [message, setMessage] = useState('');
  const { messages, isConnected, error, sendMessage, user, isParticipant } = useChat(planId || '');
  const { plan, loading: planLoading } = usePlanDetails(planId || '');
  const { refreshUser } = useUser();
  const flatListRef = useRef<FlatList<Message>>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && isConnected && isParticipant) {
      const newMessage = {
        content: message.trim(),
        sender: {
          _id: user?._id,
          username: user?.username
        },
        timestamp: new Date().toISOString()
      };
      console.log('Sending message:', newMessage);
      sendMessage(message.trim());
      setMessage('');
    }
  };

  useEffect(() => {
    const validMessages = messages.filter(msg => {
      if (!msg.id || !msg.timestamp) {
        console.log('Invalid message received:', msg);

        if (msg.sender && msg.content) {
          const fixedMessage = {
            ...msg,
            id: msg.id || `${msg.sender._id}-${Date.now()}`,
            timestamp: msg.timestamp || new Date().toISOString()
          };
          console.log('Fixed message:', fixedMessage);
          return true;
        }
        return false;
      }
      return true;
    });
    
    if (validMessages.length !== messages.length) {
      console.log('Message validation:', {
        total: messages.length,
        valid: validMessages.length,
        invalid: messages.length - validMessages.length
      });
    }
  }, [messages]);

  if (!planId) {
    return (
      <View style={styles.centered}>
        <Ionicons name="chatbubble-outline" size={64} color="#5C4D91" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No tienes chats activos</Text>
        <Text style={styles.emptyText}>Únete a un plan para empezar a chatear</Text>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => navigation.navigate('Plans')}
        >
          <Text style={styles.joinButtonText}>Ver Planes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (typeof isParticipant === 'undefined') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C4D91" />
      </View>
    );
  }

  if (!isParticipant) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="chatbubble-outline" size={64} color={theme.primary} style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: theme.primary }]}>{t('chat.title')}</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>{t('chat.joinToChat')}</Text>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: Message }) => {

    const message = {
      ...item,
      id: item.id || `${item.sender._id}-${Date.now()}`,
      timestamp: item.timestamp || new Date().toISOString()
    };

    const getIdString = (id: any) => {
      if (!id) return '';
      if (typeof id === 'string') return id;
      if (typeof id === 'object' && '$oid' in id) return id.$oid;
      if (typeof id === 'object' && '_id' in id) return getIdString(id._id);
      return String(id);
    };
    const userId = getIdString(user?._id);
    const senderId = getIdString(message?.sender?._id);
    const isOwnMessage = userId && senderId && userId === senderId;
    const isSystemMessage = String(message?.sender?._id) === 'system';
    

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        isSystemMessage && styles.systemMessage
      ]}>
        {!isSystemMessage && (
          <Text style={[
            styles.senderName,
            isOwnMessage ? styles.ownSenderName : styles.otherSenderName
          ]}>
            {message.sender.username}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          isSystemMessage && styles.systemMessageText
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {new Date(message.timestamp).toString() === 'Invalid Date' ? '' : new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{planTitle || 'Chat'}</Text>
        {!isConnected && <ActivityIndicator size="small" color="#5C4D91" />}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages.filter(msg => msg.id && msg.timestamp) as Message[]}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || `${item.sender._id}-${item.timestamp}`}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat.messagePlaceholder')}
          placeholderTextColor={theme.placeholder}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.background === '#000' ? theme.primary : '#5C4D91' },
            (!message.trim() || !isConnected) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || !isConnected}
        >
          <Ionicons name="send" size={24} color={theme.card} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E0F8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginRight: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5C4D91',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7F5FF',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    maxWidth: '100%',
  },
  senderName: {
    fontSize: 12,
    color: '#E6E0F8',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#E6E0F8',
  },
  systemMessageText: {
    color: '#F7F5FF',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    color: '#F7F5FF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E6E0F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: '#5C4D91',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ownSenderName: {
    color: '#E6E0F8',
  },
  otherSenderName: {
    color: '#5C4D91',
  },
  ownTimestamp: {
    color: '#E6E0F8',
  },
  otherTimestamp: {
    color: '#5C4D91',
  },
}); 