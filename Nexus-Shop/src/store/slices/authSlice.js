import { createSlice } from '@reduxjs/toolkit';
import { getCloudUsers, addCloudUser } from '../../services/cloudDB';

const loadCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_current_user') || 'null');
  } catch {
    return null;
  }
};

const initialState = {
  user: loadCurrentUser(),
  isAuthenticated: !!loadCurrentUser(),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action) => {
      const { name, email, password } = action.payload;
      
      // Проверяем в облаке
      getCloudUsers().then(users => {
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
        
        addCloudUser(newUser).then(success => {
          if (success) {
            state.user = newUser;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('nexus_current_user', JSON.stringify(newUser));
          }
        });
      });
    },
    
    login: (state, action) => {
      const { email, password } = action.payload;
      
      getCloudUsers().then(users => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          state.error = 'Неверный email или пароль. Возможно, аккаунт не зарегистрирован.';
          return;
        }
        
        state.user = user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('nexus_current_user', JSON.stringify(user));
      });
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
        localStorage.setItem('nexus_current_user', JSON.stringify(state.user));
      }
    }
  }
});

export const { register, login, logout, clearError, updateProfile } = authSlice.actions;
export default authSlice.reducer;