// src/services/userService.js
import { get, post, put } from '../config/api';

export const userService = {
  // Get all users (for search/contacts)
  getUsers: async (search = '') => {
    const params = new URLSearchParams({ search }).toString();
    return await get(`/users?${params}`);
  },

  // Get user profile
  getUserProfile: async (userId) => {
    return await get(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (updates) => {
    return await put('/users/profile', updates);
  },

  // Get user's contacts/friends
  getContacts: async () => {
    return await get('/users/contacts');
  },

  // Get online status
  getOnlineStatus: async () => {
    return await get('/users/online');
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    return await post('/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
