import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const { getOrdersFromFirestore } = await import('../../services/firestore');
  const orders = await getOrdersFromFirestore();
  return orders;
});

export const createOrder = createAsyncThunk('orders/createOrder', async (order) => {
  const { addOrderToFirestore } = await import('../../services/firestore');
  const id = await addOrderToFirestore(order);
  return { ...order, id };
});

export const updateOrder = createAsyncThunk('orders/updateOrder', async ({ id, ...order }) => {
  const { updateOrderInFirestore } = await import('../../services/firestore');
  await updateOrderInFirestore(id, order);
  return { ...order, id: String(id) };
});

export const removeOrder = createAsyncThunk('orders/removeOrder', async (id) => {
  const { deleteOrderFromFirestore } = await import('../../services/firestore');
  await deleteOrderFromFirestore(id);
  return String(id);
});

const initialState = {
  items: [],
  statusFilter: 'all',
  loading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    replaceOrders: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStatusFilter: (state, action) => { state.statusFilter = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(o => o.id !== action.payload);
      })
      .addCase(removeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { replaceOrders, setStatusFilter } = ordersSlice.actions;
export default ordersSlice.reducer;