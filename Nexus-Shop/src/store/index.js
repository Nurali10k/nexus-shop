import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import ordersReducer from './slices/ordersSlice';
import supportReducer from './slices/supportSlice';
import reviewsReducer from './slices/reviewsSlice';
import adminUsersReducer from './slices/adminUsersSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    ui: uiReducer,
    orders: ordersReducer,
    support: supportReducer,
    reviews: reviewsReducer,
    adminUsers: adminUsersReducer
  }
});
