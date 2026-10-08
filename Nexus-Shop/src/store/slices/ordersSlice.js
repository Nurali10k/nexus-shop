import { createSlice } from '@reduxjs/toolkit';

const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_orders') || '[]');
  } catch {
    return [];
  }
};

const saveOrders = (orders) => {
  localStorage.setItem('nexus_orders', JSON.stringify(orders));
};

const initialState = {
  items: getOrders(),
  statusFilter: 'all'
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action) => {
      state.items.push(action.payload);
      saveOrders(state.items);
    },
    
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.items.find(o => o.id === id);
      if (order) {
        order.status = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ 
          status, 
          date: new Date().toISOString() 
        });
        saveOrders(state.items);
      }
    },
    
    deleteOrder: (state, action) => {
      state.items = state.items.filter(o => o.id !== action.payload);
      saveOrders(state.items);
    },
    
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    
    loadOrders: (state) => {
      state.items = getOrders();
    },
    
    clearOrders: (state) => {
      state.items = [];
      localStorage.removeItem('nexus_orders');
    }
  }
});

export const { addOrder, updateOrderStatus, deleteOrder, setStatusFilter, loadOrders, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;