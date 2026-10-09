import { createSlice } from '@reduxjs/toolkit';

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('nexus_users') || '[]'); } 
  catch { return []; }
};

const saveUsers = (users) => {
  localStorage.setItem('nexus_users', JSON.stringify(users));
};

const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('nexus_current_user') || 'null'); } 
  catch { return null; }
};

const saveCurrentUser = (user) => {
  localStorage.setItem('nexus_current_user', JSON.stringify(user));
};

const initUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaults = [{
      id: 1, name: 'Admin', email: 'admin@nexus.com', password: 'Nexus2026!',
      role: 'admin', avatar: null, rating: 5, createdAt: new Date().toISOString()
    }];
    saveUsers(defaults);
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
      const newUser = { id: Date.now(), name, email, password, role: role || 'user', avatar: null, rating: 5, createdAt: new Date().toISOString() };
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
      if (!user) { state.error = 'Аккаунт не найден.'; return; }
      if (user.password !== password) { state.error = 'Неверный пароль.'; return; }
      saveCurrentUser(user);
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
    },

    loginWithGoogle: (state, action) => {
      const { name, email, avatar } = action.payload;
      const users = getUsers();
      let user = users.find(u => u.email === email);
      
      if (!user) {
        user = { id: Date.now(), name, email, password: null, role: 'user', avatar: avatar || null, rating: 5, createdAt: new Date().toISOString() };
        users.push(user);
        saveUsers(users);
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
    
    clearError: (state) => { state.error = null; },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const users = getUsers();
        const idx = users.findIndex(u => u.id === state.user.id);
        if (idx !== -1) { users[idx] = state.user; saveUsers(users); }
        saveCurrentUser(state.user);
      }
    }
  }
});

export const { register, login, loginWithGoogle, logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;