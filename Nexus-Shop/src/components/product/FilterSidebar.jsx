import { createSlice } from '@reduxjs/toolkit';

const getProducts = () => {
  try {
    const stored = localStorage.getItem('nexus_products');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

const saveProducts = (products) => {
  localStorage.setItem('nexus_products', JSON.stringify(products));
};

const defaultProducts = [
  {
    id: 1,
    name: 'Sony WH-1000XM5',
    category: 'headphones',
    price: 34990,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
    description: 'Премиальные беспроводные наушники с лучшим шумоподавлением в классе. 30 часов работы от батареи.',
    stock: 15
  },
  {
    id: 2,
    name: 'Keychron K2 Pro',
    category: 'keyboards',
    price: 12500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80',
    description: 'Механическая клавиатура с горячей заменой свичей. Bluetooth и проводное подключение.',
    stock: 8
  },
  {
    id: 3,
    name: 'Logitech G Pro X',
    category: 'mice',
    price: 11990,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    description: 'Игровая мышь с сенсором HERO 25K. Ультралёгкий дизайн для киберспорта.',
    stock: 20
  },
  {
    id: 4,
    name: 'Apple Watch Ultra 2',
    category: 'watches',
    price: 79990,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
    description: 'Умные часы для экстремальных видов спорта. Титановый корпус, GPS, водозащита 100м.',
    stock: 5
  },
  {
    id: 5,
    name: 'Marshall Major IV',
    category: 'headphones',
    price: 10990,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80',
    description: 'Классические наушники в ретро-дизайне. 80+ часов работы от батареи.',
    stock: 12
  },
  {
    id: 6,
    name: 'Razer DeathAdder V3',
    category: 'mice',
    price: 8490,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=500&q=80',
    description: 'Эргономичная игровая мышь с оптическим сенсором Focus Pro 30K.',
    stock: 18
  }
];

const initialState = {
  items: getProducts() || defaultProducts,
  filter: 'all',
  searchQuery: '',
  sortBy: 'popular'
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setFilters: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    addProduct: (state, action) => {
      state.items.push(action.payload);
      saveProducts(state.items);
    },
    updateProduct: (state, action) => {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
        saveProducts(state.items);
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
      saveProducts(state.items);
    },
    resetProducts: (state) => {
      state.items = defaultProducts;
      saveProducts(state.items);
    }
  }
});

export const { 
  setFilter, 
  setFilters, 
  setSearchQuery, 
  setSortBy, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  resetProducts 
} = productsSlice.actions;

export default productsSlice.reducer;