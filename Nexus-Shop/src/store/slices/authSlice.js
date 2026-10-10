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

const removeStoredPasswords = () => {
  const users = getUsers();
  if (Array.isArray(users)) {
    saveUsers(users.map((user) => {
      const sanitizedUser = { ...user };
      delete sanitizedUser.password;
      return sanitizedUser;
    }));
  }

  const currentUser = getCurrentUser();
  if (currentUser?.password) {
    const sanitizedUser = { ...currentUser };
    delete sanitizedUser.password;
    saveCurrentUser(sanitizedUser);
  }
};
removeStoredPasswords();

const initialState = {
  user: getCurrentUser(),
  isAuthenticated: !!getCurrentUser(),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginWithFirebase: (state, action) => {
      const { name, email, avatar, uid } = action.payload;
      const users = getUsers();
      const existingUser = users.find(u => u.email === email);
      const user = {
        id: uid,
        name: name || existingUser?.name || email,
        email,
        role: email === 'admin@nexus.com' ? 'admin' : 'user',
        avatar: avatar || existingUser?.avatar || null,
        rating: existingUser?.rating || 5,
        createdAt: existingUser?.createdAt || new Date().toISOString()
      };
      const userIndex = users.findIndex(existing => existing.email === email);
      if (userIndex === -1) users.push(user);
      else {
        users[userIndex] = { ...users[userIndex], ...user };
        delete users[userIndex].password;
      }
      saveUsers(users);
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

export const { loginWithFirebase, logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;