import { createSlice } from '@reduxjs/toolkit'
import { readStorage } from '../storage'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: readStorage('theme', 'dark') === 'light' ? 'light' : 'dark',
    language: ['ru', 'en', 'kg'].includes(readStorage('language', 'ru')) ? readStorage('language', 'ru') : 'ru',
    toasts: [],
  },
  reducers: {
    setTheme: (state, action) => { state.theme = action.payload },
    setLanguage: (state, action) => { state.language = action.payload },
    addToast: (state, action) => { state.toasts.push({ id: Date.now(), ...action.payload }) },
    removeToast: (state, action) => { state.toasts = state.toasts.filter((toast) => toast.id !== action.payload) },
  },
})

export const { setTheme, setLanguage, addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
