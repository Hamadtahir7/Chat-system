// src/services/authService.js
import { post } from '../config/api';

export const authService = {
  signup: async (username, email, password) => {
    const response = await post('/auth/register', {
      username,
      email,
      password,
    });
    return response;
  },

  login: async (email, password) => {
    const response = await post('/auth/login', {
      email,
      password,
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),
};
