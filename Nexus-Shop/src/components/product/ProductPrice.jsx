export default function ProductPrice({ price, className = '' }) {
  return <span className={`font-bold ${className}`}>{Number(price || 0).toLocaleString('ru-RU')} сом</span>;
}
