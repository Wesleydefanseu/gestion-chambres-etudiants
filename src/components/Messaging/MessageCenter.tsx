import React, { useState, useEffect } from 'react';
import { Send, Search, User, MessageCircle, Phone, Clock, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  room_id?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    role: string;
  };
  receiver?: {
    id: string;
    name: string;
    role: string;
  };
  room?: {
    id: string;
    title: string;
  };
}

interface Conversation {
  user: {
    id: string;
    name: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

interface MessageCenterProps {
  onClose?: () => void;
  initialReceiverId?: string;
  initialRoomId?: string;
}

export default function MessageCenter({ onClose, initialReceiverId, initialRoomId }: MessageCenterProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (initialReceiverId && conversations.length > 0) {
      const conversation = conversations.find(c => c.user.id === initialReceiverId);
      if (conversation) {
        setSelectedConversation(conversation);
        setMessages(conversation.messages);
      }
    }
  }, [initialReceiverId, conversations]);

  const fetchMessages = async () => {
    try {
      const response = await apiService.getMessages();
      if (response.success) {
        const allMessages = response.data;
        groupMessagesIntoConversations(allMessages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupMessagesIntoConversations = (allMessages: Message[]) => {
    const conversationMap = new Map<string, Conversation>();

    allMessages.forEach(message => {
      const otherUserId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === user?.id ? message.receiver : message.sender;

      if (!otherUser) return;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }

      const conversation = conversationMap.get(otherUserId)!;
      conversation.messages.push(message);

      // Mettre à jour le dernier message si plus récent
      if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
        conversation.lastMessage = message;
      }

      // Compter les messages non lus
      if (!message.is_read && message.receiver_id === user?.id) {
        conversation.unreadCount++;
      }
    });

    // Trier les conversations par dernier message
    const sortedConversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );

    setConversations(sortedConversations);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await apiService.sendMessage({
        receiver_id: selectedConversation.user.id,
        room_id: initialRoomId,
        message: newMessage.trim()
      });

      if (response.success) {
        setNewMessage('');
        fetchMessages(); // Recharger les messages
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await apiService.markMessageAsRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ));

    // Marquer les messages non lus comme lus
    conversation.messages.forEach(message => {
      if (!message.is_read && message.receiver_id === user?.id) {
        markAsRead(message.id);
      }
    });
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Étudiant';
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'text-blue-600';
      case 'owner': return 'text-green-600';
      case 'admin': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.user.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.user.id === conversation.user.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold">
                      {conversation.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.user.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm ${getRoleColor(conversation.user.role)} mb-1`}>
                      {getRoleLabel(conversation.user.role)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header de la conversation */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {selectedConversation.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedConversation.user.name}
                  </h4>
                  <p className={`text-sm ${getRoleColor(selectedConversation.user.role)}`}>
                    {getRoleLabel(selectedConversation.user.role)}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message.room && (
                      <p className="text-xs opacity-75 mb-1">
                        À propos de: {message.room.title}
                      </p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {formatTime(message.created_at)}
                      </span>
                      {message.sender_id === user?.id && (
                        <span className="text-xs opacity-75">
                          {message.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}