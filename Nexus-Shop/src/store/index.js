import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './slices/productsSlice'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import ordersReducer from './slices/ordersSlice'
import { writeStorage } from './storage'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    ui: uiReducer,
    orders: ordersReducer,
  },
})

store.subscribe(() => {
  const { products, cart, wishlist, auth, ui, orders } = store.getState()
  writeStorage('products', products.items)
  writeStorage('cart', cart.items)
  writeStorage('wishlist', wishlist.items)
  writeStorage('nexusCurrentUser', auth.user)
  writeStorage('theme', ui.theme)
  writeStorage('language', ui.language)
  writeStorage('orders', orders.items)
})
