import { createSlice } from '@reduxjs/toolkit';

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Инициализация пользователей
let users = loadFromStorage('nexus_users', []);
if (users.length === 0) {
  users = [{
    id: 1,
    name: 'Admin',
    email: 'admin@nexus.com',
    password: 'Nexus2026!',
    role: 'admin',
    createdAt: new Date().toISOString()
  }];
  localStorage.setItem('nexus_users', JSON.stringify(users));
}

const initialState = {
  user: loadFromStorage('nexus_current_user', null),
  isAuthenticated: !!loadFromStorage('nexus_current_user', null),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action) => {
      const { name, email, password } = action.payload;
      users = loadFromStorage('nexus_users', []);
      
      const exists = users.find(u => u.email === email);
      if (exists) {
        state.error = 'Пользователь с таким email уже существует';
        return;
      }
      
      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('nexus_users', JSON.stringify(users));
      
      state.user = newUser;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('nexus_current_user', JSON.stringify(newUser));
    },
    
    login: (state, action) => {
      const { email, password } = action.payload;
      users = loadFromStorage('nexus_users', []);
      
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        state.error = 'Неверный email или пароль. Возможно, аккаунт не зарегистрирован.';
        return;
      }
      
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('nexus_current_user', JSON.stringify(user));
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('nexus_current_user');
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        users = loadFromStorage('nexus_users', []);
        const idx = users.findIndex(u => u.id === state.user.id);
        if (idx !== -1) {
          users[idx] = state.user;
          localStorage.setItem('nexus_users', JSON.stringify(users));
        }
        localStorage.setItem('nexus_current_user', JSON.stringify(state.user));
      }
    }
  }
});

export const { register, login, logout, clearError, updateProfile } = authSlice.actions;
export default authSlice.reducer;