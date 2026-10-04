import ProductCard from './ProductCard'

export default function ProductGrid({ products }) {
  if (products.length === 0) return <p className="py-16 text-center text-gray-500">Товары не найдены.</p>

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}