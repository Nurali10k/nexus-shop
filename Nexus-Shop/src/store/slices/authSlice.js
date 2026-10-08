import { createSlice } from '@reduxjs/toolkit';

// Вспомогательные функции
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem('nexus_users', JSON.stringify(users));
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_current_user') || 'null');
  } catch {
    return null;
  }
};

const saveCurrentUser = (user) => {
  localStorage.setItem('nexus_current_user', JSON.stringify(user));
};

// Инициализация тестовых пользователей
const initUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@nexus.com',
        password: 'Nexus2026!',
        role: 'admin',
        avatar: null,
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ];
    saveUsers(defaultUsers);
  }
};

initUsers();

const initialState = {
  user: getCurrentUser(),
  isAuthenticated: !!getCurrentUser(),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action) => {
      const { name, email, password, role } = action.payload;
      const users = getUsers();
      
      if (users.find(u => u.email === email)) {
        state.error = 'Этот email уже зарегистрирован';
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: role || 'user',
        avatar: null,
        rating: 5,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      saveUsers(users);
      saveCurrentUser(newUser);
      
      state.user = newUser;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    login: (state, action) => {
      const { email, password } = action.payload;
      const users = getUsers();
      
      const user = users.find(u => u.email === email);
      
      if (!user) {
        state.error = 'Аккаунт не найден. Зарегистрируйтесь.';
        return;
      }
      
      if (user.password !== password) {
        state.error = 'Неверный пароль.';
        return;
      }
      
      saveCurrentUser(user);
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
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
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const users = getUsers();
        const idx = users.findIndex(u => u.id === state.user.id);
        if (idx !== -1) {
          users[idx] = state.user;
          saveUsers(users);
        }
        saveCurrentUser(state.user);
      }
    }
  }
});

export const { register, login, logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;