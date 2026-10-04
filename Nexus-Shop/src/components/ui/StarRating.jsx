import { Star } from 'lucide-react'

export default function StarRating({ rating, size = 18 }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Рейтинг ${rating} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} className={index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-sm text-gray-500">{Number(rating).toFixed(1)}</span>
    </span>
  )
}