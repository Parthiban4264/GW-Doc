import { create } from 'zustand';

const USERS_KEY = 'registered_users';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  error: null,
  
  login: (credentials) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      set({ error: 'User not found. Please sign up first.' });
      return false;
    }
    
    if (user.password !== credentials.password) {
      set({ error: 'Invalid password' });
      return false;
    }
    
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true, error: null });
    return true;
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, error: null });
  },

  signup: (userData) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some(u => u.email === userData.email)) {
      set({ error: 'Email already registered. Please sign in.' });
      return false;
    }

    const newUser = {
      id: Date.now(),
      email: userData.email,
      username: userData.username,
      password: userData.password
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const publicUserData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    };

    localStorage.setItem('user', JSON.stringify(publicUserData));
    set({ user: publicUserData, isAuthenticated: true, error: null });
    return true;
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
