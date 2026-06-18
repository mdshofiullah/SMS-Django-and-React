import { create } from 'zustand';
import api from '../api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('auth/login/', { email, password });
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.detail || 'Invalid email or password', 
        loading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('auth/logout/', { refresh });
      }
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (updatedData) => {
    try {
      const response = await api.put('auth/me/', updatedData);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data });
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  }
}));

export default useAuthStore;
