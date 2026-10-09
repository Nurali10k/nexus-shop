import { createSlice } from '@reduxjs/toolkit';

const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_wishlist') || '[]');
  } catch {
    return [];
  }
};

const saveWishlist = (items) => {
  localStorage.setItem('nexus_wishlist', JSON.stringify(items));
};

const initialState = {
  items: getWishlist()
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.find(item => item?.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        saveWishlist(state.items);
      }
    },
    toggleWishlist: (state, action) => {
      const exists = state.items.some(item => item?.id === action.payload.id);
      state.items = exists
        ? state.items.filter(item => item?.id !== action.payload.id)
        : [...state.items, action.payload];
      saveWishlist(state.items);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item?.id !== action.payload);
      saveWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('nexus_wishlist');
    },
    loadWishlist: (state) => {
      state.items = getWishlist();
    }
  }
});

export const { addToWishlist, toggleWishlist, removeFromWishlist, clearWishlist, loadWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;