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
      sendMessage(message.trim());
      setMessage('');
    }
  };

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

  const renderMessage = ({ item }: { item: Message }) => {
    const userId = String(user?.id);
    const senderId = String(item.sender.id);
    const sender_Id = String(item.sender._id);
    const isOwnMessage = senderId === userId || sender_Id === userId;
    const isSystemMessage = item.sender.id === 'system';

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
            {item.sender.username}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          isSystemMessage && styles.systemMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{planTitle || 'Chat'}</Text>
        {!isConnected && <ActivityIndicator size="small" color="#5C4D91" />}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, !isParticipant && styles.inputDisabled]}
          value={message}
          onChangeText={setMessage}
          placeholder={isParticipant ? "Type a message..." : "Únete al plan para chatear"}
          placeholderTextColor="#A9A9A9"
          multiline
          editable={isParticipant}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || !isConnected || !isParticipant) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || !isConnected || !isParticipant}
        >
          <Ionicons name="send" size={24} color={message.trim() && isParticipant ? "#fff" : "#A9A9A9"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E0F8',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F5FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5C4D91',
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
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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