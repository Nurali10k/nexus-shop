import { createSlice } from '@reduxjs/toolkit';

const loadMessages = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_support') || '[]');
  } catch {
    return [];
  }
};

const initialState = {
  messages: loadMessages(),
  isOpen: false
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('nexus_support', JSON.stringify(state.messages));
    },
    
    markAsRead: (state, action) => {
      const msg = state.messages.find(m => m.id === action.payload);
      if (msg) msg.read = true;
      localStorage.setItem('nexus_support', JSON.stringify(state.messages));
    },
    
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
      localStorage.setItem('nexus_support', JSON.stringify(state.messages));
    },
    
    toggleSupport: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    clearMessages: (state) => {
      state.messages = [];
      localStorage.removeItem('nexus_support');
    }
  }
});
addMessage: (state, action) => {
  state.messages.push({
    id: Date.now() + Math.random(),
    ...action.payload,
    timestamp: action.payload.timestamp || new Date().toISOString(),
    read: false
  });
  localStorage.setItem('nexus_support', JSON.stringify(state.messages));
}

export const { addMessage, markAsRead, deleteMessage, toggleSupport, clearMessages } = supportSlice.actions;
export default supportSlice.reducer;