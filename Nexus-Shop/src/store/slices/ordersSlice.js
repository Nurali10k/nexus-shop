import { createSlice } from '@reduxjs/toolkit'
import { readStorage } from '../storage'

export const ORDER_STATUSES = ['Новый', 'В сборке', 'В пути', 'Доставлен', 'Отменён']

const savedOrders = readStorage('orders', [])

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: Array.isArray(savedOrders) ? savedOrders : [] },
  reducers: {
    addOrder: (state, action) => { state.items.push(action.payload) },
    updateOrderStatus: (state, action) => {
      const order = state.items.find((entry) => entry.id === action.payload.id)
      if (order && ORDER_STATUSES.includes(action.payload.status)) order.status = action.payload.status
    },
  },
})

export const { addOrder, updateOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer
