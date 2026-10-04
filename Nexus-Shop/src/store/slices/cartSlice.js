import { createSlice } from '@reduxjs/toolkit'
import { readStorage } from '../storage'

const savedItems = readStorage('cart', [])

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: Array.isArray(savedItems) ? savedItems : [], isOpen: false },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) existing.quantity = Math.min(existing.quantity + 1, product.stock ?? Infinity)
      else state.items.push({ ...product, quantity: 1 })
    },
    removeFromCart: (state, action) => { state.items = state.items.filter((item) => item.id !== action.payload) },
    updateQuantity: (state, action) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (item) item.quantity = Math.max(1, Math.min(Number(action.payload.quantity) || 1, item.stock ?? Infinity))
    },
    clearCart: (state) => { state.items = [] },
    toggleCart: (state) => { state.isOpen = !state.isOpen },
    closeCart: (state) => { state.isOpen = false },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } = cartSlice.actions
export default cartSlice.reducer
