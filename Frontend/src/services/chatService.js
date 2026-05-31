// src/services/chatService.js
import { get, post, del } from '../config/api';
import { getSocket } from '../config/socket';

export const chatService = {
  // Get all chats for current user
  getChats: async () => {
    return await get('/chats');
  },

  // Get specific chat
  getChat: async (chatId) => {
    return await get(`/chats/${chatId}`);
  },

  // Create new chat/DM or group
  createChat: async (participantIds, chatName, isGroup = false) => {
    if (isGroup) {
      // Create group chat
      return await post('/chats/group', {
        title: chatName,
        member_ids: participantIds,
      });
    } else {
      // Create private/DM chat with first participant
      const userId = participantIds[0];
      return await post('/chats/private', {
        user_id: userId,
      });
    }
  },

  // Get chat members
  getChatMembers: async (chatId) => {
    return await get(`/chats/${chatId}/members`);
  },

  // Add member to chat
  addMember: async (chatId, userId) => {
    return await post(`/chats/${chatId}/members`, { user_id: userId });
  },

  // Remove member from chat
  removeMember: async (chatId, userId) => {
    return await del(`/chats/${chatId}/members/${userId}`);
  },
};
