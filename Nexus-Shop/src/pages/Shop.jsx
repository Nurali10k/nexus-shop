import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { setFilter, setSearchQuery, setSortBy, replaceProducts } from '../store/slices/productsSlice'
import { addToCart } from '../store/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'
import { addToast } from '../store/slices/uiSlice'
import { t } from '../i18n/translations'
import ProductSearch from '../components/product/ProductSearch'
import ProductSortSelect from '../components/product/ProductSortSelect'
import CategoryFilter from '../components/product/CategoryFilter'
import ProductResultsCount from '../components/product/ProductResultsCount'
import EmptyProducts from '../components/product/EmptyProducts'
import ShopProductCard from '../components/product/ShopProductCard'

const CATEGORIES = [
  { id: 'all', translationKey: 'allProducts', icon: '🛍️' },
  { id: 'headphones', translationKey: 'headphones', icon: '🎧' },
  { id: 'keyboards', translationKey: 'keyboards', icon: '⌨️' },
  { id: 'mice', translationKey: 'mice', icon: '🖱️' },
  { id: 'watches', translationKey: 'watches', icon: '⌚' },
]
const SORT_OPTIONS = [
  { id: 'popular', translationKey: 'sortByPopularity' },
  { id: 'price-asc', translationKey: 'sortByPriceAsc' },
  { id: 'price-desc', translationKey: 'sortByPriceDesc' },
  { id: 'rating', translationKey: 'sortByRating' },
]

export default function Shop() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const filter = useSelector((state) => state.products.filter)
  const searchQuery = useSelector((state) => state.products.searchQuery)
  const sortBy = useSelector((state) => state.products.sortBy)
  const cartItems = useSelector((state) => state.cart.items)
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const language = useSelector((state) => state.ui.language)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}
    import('../services/firestore').then(({ subscribeToProducts }) => {
      if (!active) return
      unsubscribe = subscribeToProducts(
        (items) => dispatch(replaceProducts(items)),
        (error) => dispatch(addToast({ message: `${t('productsLoadFailed', language)} ${error.message}`, type: 'error' })),
      )
    }).catch((error) => dispatch(addToast({ message: `${t('productsConnectFailed', language)} ${error.message}`, type: 'error' })))
    return () => { active = false; unsubscribe() }
  }, [dispatch, language])

  const filteredProducts = products.filter((product) => {
    if (!product || !product.category) return false
    return (filter === 'all' || product.category === filter)
      && product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    return 0
  })

  const addProduct = (product) => {
    if (cartItems.some((item) => item.id === product.id)) {
      dispatch(addToast({ message: t('productAlreadyInCart', language), type: 'info' }))
      return
    }
    dispatch(addToCart({ ...product, quantity: 1 }))
    dispatch(addToast({ message: `${product.name} ${t('addedToCart', language)}`, type: 'success' }))
  }

  const toggleFavorite = (product) => {
    const exists = wishlistItems.some((item) => item?.id === product.id)
    dispatch(exists ? removeFromWishlist(product.id) : addToWishlist(product))
    dispatch(addToast({ message: t(exists ? 'removedFromWishlist' : 'addedToWishlist', language), type: 'info' }))
  }

  return <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
    <div className="container mx-auto px-4">
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{t('shopTitle', language)}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('shopSubtitle', language)}</p>
      </motion.header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <ProductSearch value={searchQuery} onChange={(value) => dispatch(setSearchQuery(value))} placeholder={t('searchPlaceholder', language)} />
        <ProductSortSelect value={sortBy} options={SORT_OPTIONS} onChange={(value) => dispatch(setSortBy(value))} translate={(key) => t(key, language)} />
        <button type="button" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-white md:hidden"><Filter size={20} />{t('filters', language)}</button>
      </div>

      <CategoryFilter categories={CATEGORIES} selected={filter} onSelect={(category) => dispatch(setFilter(category))} translate={(key) => t(key, language)} visible={showFilters} />
      <ProductResultsCount label={t('productsFound', language)} count={filteredProducts.length} />

      {filteredProducts.length === 0 ? <EmptyProducts title={t('noProducts', language)} hint={t('adjustSearch', language)} /> :
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => <ShopProductCard key={product.id || index} product={product} index={index} isFavorite={wishlistItems.some((item) => item?.id === product.id)} onToggleFavorite={toggleFavorite} onAddToCart={addProduct} noName={t('noName', language)} noImage={t('noImage', language)} />)}
        </div>}
    </div>
  </div>
}
