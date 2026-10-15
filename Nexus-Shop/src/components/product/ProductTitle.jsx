import { Link } from 'react-router-dom'

export default function ProductTitle({ product, className = '' }) {
  return (
    <Link to={`/product/${product.id}`} className={`font-semibold hover:text-primary-600 ${className}`}>
      {product.name}
    </Link>
  )
}
