export default function ProductPrice({ price, className = '' }) {
  return <span className={`font-bold ${className}`}>{Number(price).toLocaleString('ru-RU')} ₽</span>
}
