import { createSlice } from '@reduxjs/toolkit'
import { readStorage } from '../storage'

export const mockProducts = [
  { id: 1, name: 'Sony WH-1000XM5', category: 'headphones', price: 34990, rating: 4.9, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', description: 'Премиальные беспроводные наушники с адаптивным шумоподавлением и детализированным звуком.', stock: 15 },
  { id: 2, name: 'Keychron K2 Pro', category: 'keyboards', price: 12500, rating: 4.8, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800', description: 'Компактная механическая клавиатура с беспроводным подключением и горячей заменой переключателей.', stock: 8 },
  { id: 3, name: 'Logitech G Pro X', category: 'mice', price: 11990, rating: 4.9, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', description: 'Точная игровая мышь с лёгким корпусом и профессиональным сенсором.', stock: 20 },
  { id: 4, name: 'Apple Watch Ultra 2', category: 'watches', price: 79990, rating: 5, image: 'https://images.unsplash.com/photo-1673308026259-3e4b08878e80?w=800', description: 'Прочные умные часы для спорта и путешествий с ярким дисплеем.', stock: 5 },
  { id: 5, name: 'Marshall Major IV', category: 'headphones', price: 10990, rating: 4.7, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', description: 'Накладные наушники с фирменным звучанием и длительным временем работы.', stock: 12 },
  { id: 6, name: 'Razer DeathAdder V3', category: 'mice', price: 8490, rating: 4.8, image: 'https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=800', description: 'Эргономичная игровая мышь с высокой точностью и быстрым откликом.', stock: 18 },
  { id: 7, name: 'Logitech MX Keys S', category: 'keyboards', price: 13990, rating: 4.7, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', description: 'Удобная беспроводная клавиатура для работы на нескольких устройствах.', stock: 10 },
  { id: 8, name: 'Samsung Galaxy Watch', category: 'watches', price: 24990, rating: 4.6, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', description: 'Современные умные часы с мониторингом активности и уведомлениями.', stock: 7 },
]

const savedProducts = readStorage('products', mockProducts)

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: Array.isArray(savedProducts) ? savedProducts : mockProducts,
    filters: { category: 'all', priceRange: [0, 100000], rating: 0 },
    searchQuery: '',
    sortBy: 'name',
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload },
    setSortBy: (state, action) => { state.sortBy = action.payload },
    addProduct: (state, action) => { state.items.push(action.payload) },
    updateProduct: (state, action) => {
      const index = state.items.findIndex((product) => product.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    deleteProduct: (state, action) => { state.items = state.items.filter((product) => product.id !== action.payload) },
  },
})

export const { setFilters, setSearchQuery, setSortBy, addProduct, updateProduct, deleteProduct } = productsSlice.actions
export default productsSlice.reducer
