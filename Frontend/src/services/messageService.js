// src/services/messageService.js
import { get, post, put, del } from '../config/api';
import { getSocket } from '../config/socket';

export const messageService = {
  // Get messages for a chat - endpoint is /chats/:id/messages
  // Returns { data: [...], has_more: boolean } from backend
  getMessages: async (chatId, limit = 50, offset = 0) => {
    const params = new URLSearchParams({ limit, offset }).toString();
    return await get(`/chats/${chatId}/messages?${params}`);
  },

  // Send message via Socket.io
  sendMessage: async (chatId, content, messageType = 'text', replyTo = null) => {
    const socket = getSocket();
    if (!socket) throw new Error('Socket not connected');

    return new Promise((resolve, reject) => {
      socket.emit('send_message', {
        chat_id: chatId,
        content,
        message_type: messageType,
        reply_to: replyTo,
      }, (response) => {
        if (response.error) reject(new Error(response.error));
        else resolve(response);
      });
    });
  },

  // Edit message
  editMessage: async (messageId, content) => {
    return await put(`/messages/${messageId}`, { content });
  },

  // Delete message
  deleteMessage: async (messageId) => {
    return await del(`/messages/${messageId}`);
  },

  // Mark messages as read
  markAsRead: async (chatId) => {
    return await post(`/messages/read`, { chat_id: chatId });
  },

  // Get message reactions
  getReactions: async (messageId) => {
    return await get(`/messages/${messageId}/reactions`);
  },

  // Add reaction
  addReaction: async (messageId, emoji) => {
    return await post(`/messages/${messageId}/reactions`, { emoji });
  },
};
