import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import ProductImage from './ProductImage'
import ProductTitle from './ProductTitle'
import ProductPrice from './ProductPrice'
import AddToCartButton from './AddToCartButton'
import ReserveButton from './ReserveButton'
import StarRating from '../ui/StarRating'
import { t } from '../../i18n/translations'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const reduceMotion = useReducedMotion()
  const language = useSelector((state) => state.ui.language)
  const wishlist = useSelector((state) => state.wishlist.items)
  const isInWishlist = wishlist.some((item) => item.id === product.id)

  return (
    <motion.article layout initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={reduceMotion ? undefined : { y: -5 }} transition={{ duration: 0.24 }} className="card group overflow-hidden">
      <div className="relative">
        <Link to={`/product/${product.id}`} aria-label={`Product: ${product.name}`}>
          <ProductImage product={product} className="h-52 w-full transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button type="button" aria-label={t(isInWishlist ? 'removeFromWishlist' : 'addToWishlist', language)} aria-pressed={isInWishlist} onClick={() => dispatch(toggleWishlist(product))} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:text-red-500 dark:bg-gray-900/90 dark:text-white">
          <Heart size={18} className={isInWishlist ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>
      <div className="p-4">
        <p className="mb-1 text-xs uppercase tracking-wider text-primary-600">{product.category ? t(product.category, language) : t('noCategory', language)}</p>
        <ProductTitle product={product} />
        <div className="my-3 flex items-center gap-2"><StarRating rating={product.avgRating || 0} size={15} /><span className="text-xs text-gray-500">{Number(product.reviewCount || 0)}</span></div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProductPrice price={product.price} className="text-lg" />
          <div className="flex gap-2">
            <AddToCartButton product={product} />
            <ReserveButton product={product} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
