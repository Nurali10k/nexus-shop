import { createSlice } from '@reduxjs/toolkit';
import { translations } from '../../i18n/translations';

const initialState = {
  theme: localStorage.getItem('nexus_theme') || 'dark',
  language: localStorage.getItem('nexus_lang') || 'ru',
  toasts: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('nexus_theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('nexus_lang', action.payload);
    },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  }
});

export const { setTheme, setLanguage, addToast, removeToast } = uiSlice.actions;

// Селектор для получения переводов
export const selectTranslations = (state) => {
  const lang = state.ui.language;
  return translations[lang] || translations.ru;
};

export default uiSlice.reducer;