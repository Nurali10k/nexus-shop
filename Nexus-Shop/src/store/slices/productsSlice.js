import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { defaultProducts } from '../defaultProducts';

const getStoredProducts = () => {
  try {
    const items = JSON.parse(localStorage.getItem('nexus_products') || 'null');
    return Array.isArray(items) && items.length > 0 ? items : defaultProducts;
  } catch {
    return defaultProducts;
  }
};

// Async thunks для Firestore
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const { getProductsFromFirestore } = await import('../../services/firestore');
  const products = await getProductsFromFirestore();
  return products;
});

export const createProduct = createAsyncThunk('products/createProduct', async (product) => {
  const { addProductToFirestore } = await import('../../services/firestore');
  const id = await addProductToFirestore(product);
  return { ...product, id };
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, ...product }) => {
  const { updateProductInFirestore } = await import('../../services/firestore');
  await updateProductInFirestore(id, product);
  return { ...product, id: String(id) };
});

export const removeProduct = createAsyncThunk('products/removeProduct', async (id) => {
  const { deleteProductFromFirestore } = await import('../../services/firestore');
  await deleteProductFromFirestore(id);
  return String(id);
});

const initialState = {
  items: getStoredProducts(),
  filter: 'all',
  searchQuery: '',
  sortBy: 'popular',
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    replaceProducts: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilter: (state, action) => { state.filter = action.payload; },
    setFilters: (state, action) => { state.filter = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    setSortBy: (state, action) => { state.sortBy = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { replaceProducts, setFilter, setFilters, setSearchQuery, setSortBy } = productsSlice.actions;
export default productsSlice.reducer;