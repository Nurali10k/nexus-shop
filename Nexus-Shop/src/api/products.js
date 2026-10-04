import { mockProducts } from '../store/slices/productsSlice'

export async function fetchProducts() {
  return mockProducts.map((product) => ({ ...product }))
}