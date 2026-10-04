import { motion, useReducedMotion } from 'framer-motion'
import { Heart, ShoppingCart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import { addToast } from '../../store/slices/uiSlice'
import StarRating from '../ui/StarRating'
import { t } from '../../i18n/translations'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const reduceMotion = useReducedMotion()
  const language = useSelector((state) => state.ui.language)
  const wishlist = useSelector((state) => state.wishlist.items)
  const isInWishlist = wishlist.some((item) => item.id === product.id)

  const handleAddToCart = () => {
    dispatch(addToCart(product))
    dispatch(addToast({ id: Date.now(), message: `${product.name} — ${t('common.success', language)}`, type: 'success' }))
  }

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.24 }}
      className="card group overflow-hidden"
    >
      <div className="relative">
        <Link to={`/product/${product.id}`} aria-label={`Подробнее: ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          aria-label={isInWishlist ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={isInWishlist}
          onClick={() => dispatch(toggleWishlist(product))}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:text-red-500 dark:bg-gray-900/90 dark:text-white"
        >
          <motion.span animate={{ scale: isInWishlist && !reduceMotion ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.25 }}>
            <Heart size={18} className={isInWishlist ? 'fill-red-500 text-red-500' : ''} />
          </motion.span>
        </button>
      </div>
      <div className="p-4">
        <p className="mb-1 text-xs uppercase tracking-wider text-primary-600">{product.category}</p>
        <Link to={`/product/${product.id}`} className="font-semibold hover:text-primary-600">{product.name}</Link>
        <div className="my-3"><StarRating rating={product.rating} size={15} /></div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-bold">{product.price.toLocaleString('ru-RU')} ₽</span>
          <motion.button type="button" onClick={handleAddToCart} disabled={product.stock < 1} aria-label={`${t('product.addToCart', language)}: ${product.name}`} whileTap={reduceMotion ? undefined : { scale: 0.88 }} className="rounded-lg bg-primary-600 p-2 text-white transition hover:bg-primary-700 disabled:opacity-50">
            <ShoppingCart size={18} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}