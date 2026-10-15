export default function ProductImage({ product, className = '' }) {
  return (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      className={`object-cover ${className}`}
    />
  )
}
