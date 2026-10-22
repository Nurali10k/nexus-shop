import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { productDescription, t } from '../../i18n/translations';

export default function ShopProductCard({ product, index, isFavorite, onToggleFavorite, onAddToCart, noName, noImage }) {
  const language = useSelector((state) => state.ui.language);
  const category = product.category ? t(product.category, language) : t('noCategory', language);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-2xl border border-gray-700 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:bg-gray-800"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {product.image ? (
          <img src={product.image} alt={product.name || noName} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        ) : <div className="grid h-full place-items-center text-gray-400">{noImage}</div>}
        <button type="button" aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isFavorite} onClick={() => onToggleFavorite(product)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow transition hover:scale-110 hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-200">
          <Heart size={19} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium uppercase text-purple-600 dark:text-purple-400">{category}</p>
          <div className="flex shrink-0 items-center gap-1 text-sm text-gray-500 dark:text-gray-400" aria-label={`Rating ${product.avgRating || 0} out of 5`}>
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span>{Number(product.avgRating || 0).toFixed(1)} ({Number(product.reviewCount || 0)})</span>
          </div>
        </div>
        <h2 className="mb-2 min-h-12 line-clamp-2 font-semibold text-gray-900 dark:text-white">
          <Link to={`/product/${product.id}`} className="transition-colors hover:text-purple-400">{product.name || noName}</Link>
        </h2>
        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500 dark:text-gray-400">{productDescription(product, language)}</p>
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{Number(product.price || 0).toLocaleString('ru-RU')} сом</span>
          <div className="flex gap-2">
            <button type="button" aria-label={`${t('addToCart', language)}: ${product.name || noName}`} disabled={product.stock < 1} onClick={() => onAddToCart(product)} className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 p-2 text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"><ShoppingCart size={18} /></button>
            <Link to={`/product/${product.id}`} aria-label={`More details about ${product.name || noName}`} className="rounded-lg border border-gray-600 p-2 text-gray-500 transition hover:border-purple-500 hover:text-purple-400 dark:text-gray-300"><ArrowUpRight size={18} /></Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
