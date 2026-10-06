import { createSlice } from '@reduxjs/toolkit';
import { getCloudOrders, addCloudOrder, updateCloudOrderStatus } from '../../services/cloudDB';

const initialState = {
  items: [],
  statusFilter: 'all',
  loaded: false
};

// Thunk для загрузки заказов из облака
export const loadOrdersFromCloud = () => async (dispatch) => {
  const orders = await getCloudOrders();
  dispatch(setOrders(orders));
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    },
    
    addOrder: (state, action) => {
      state.items.push(action.payload);
      // Сохраняем в облако
      addCloudOrder(action.payload);
    },
    
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.items.find(o => o.id === id);
      if (order) {
        order.status = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status, date: new Date().toISOString() });
        // Обновляем в облаке
        updateCloudOrderStatus(id, status);
      }
    },
    
    deleteOrder: (state, action) => {
      state.items = state.items.filter(o => o.id !== action.payload);
    },
    
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    
    clearOrders: (state) => {
      state.items = [];
    }
  }
});

export const { setOrders, addOrder, updateOrderStatus, deleteOrder, setStatusFilter, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;