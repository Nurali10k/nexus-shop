import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star } from 'lucide-react'

export default function ShopProductCard({ product, index, isFavorite, onToggleFavorite, onAddToCart, noName, noImage }) {
  return <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.3) }} whileHover={{ y: -6 }} className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-2xl dark:bg-gray-800">
    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
      {product.image ? <img src={product.image} alt={product.name || noName} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <div className="grid h-full place-items-center text-gray-400">{noImage}</div>}
      <button type="button" aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'} onClick={() => onToggleFavorite(product)} className="absolute right-3 top-3 rounded-full bg-white/85 p-2 backdrop-blur hover:scale-110 dark:bg-gray-800/85"><Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} /></button>
    </div>
    <div className="p-4">
      <p className="mb-1 text-xs font-medium uppercase text-purple-600 dark:text-purple-400">{product.category}</p>
      <h3 className="mb-3 line-clamp-2 font-bold text-gray-900 dark:text-white">{product.name || noName}</h3>
      <div className="mb-3 flex items-center gap-1" aria-label={`Рейтинг ${product.rating || 0}`}>
        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} className={star <= Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)}
        <span className="ml-1 text-sm text-gray-500">{product.rating || 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{(product.price || 0).toLocaleString()} сом</span>
        <button type="button" aria-label="Добавить в корзину" onClick={() => onAddToCart(product)} className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 p-2 text-white hover:shadow-lg"><ShoppingCart size={18} /></button>
      </div>
    </div>
  </motion.article>
}
