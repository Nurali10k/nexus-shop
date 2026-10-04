import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'

export default function Wishlist() {
  const items = useSelector((state) => state.wishlist.items)

  return (
    <section className="page-shell">
      <h1 className="mb-8 text-4xl font-bold">Избранное</h1>
      {items.length ? <ProductGrid products={items} /> : <div className="card py-16 text-center"><p className="mb-4 text-gray-500">В избранном пока ничего нет.</p><Link to="/shop" className="text-primary-600">Найти товары</Link></div>}
    </section>
  )
}