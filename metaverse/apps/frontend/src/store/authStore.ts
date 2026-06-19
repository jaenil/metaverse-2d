import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  userId: string | null;
  userType: 'admin' | 'user' | null;
  setAuth: (token: string, userId: string, userType: 'admin' | 'user') => void;
  clearAuth: () => void;
}

const stored = {
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  userType: (localStorage.getItem('userType') as 'admin' | 'user' | null),
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: stored.token,
  userId: stored.userId,
  userType: stored.userType,

  setAuth: (token, userId, userType) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userType', userType);
    set({ token, userId, userType });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    set({ token: null, userId: null, userType: null });
  },
}));
