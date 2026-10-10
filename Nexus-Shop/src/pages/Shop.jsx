import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Search, Filter, X } from 'lucide-react';
import { setFilter, setSearchQuery, setSortBy } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToast } from '../store/slices/uiSlice';
import { replaceProducts } from '../store/slices/productsSlice';
import { t } from '../i18n/translations';

const CATEGORIES = [
  { id: 'all', translationKey: 'allProducts', icon: '🛍️' },
  { id: 'headphones', translationKey: 'headphones', icon: '🎧' },
  { id: 'keyboards', translationKey: 'keyboards', icon: '⌨️' },
  { id: 'mice', translationKey: 'mice', icon: '🖱️' },
  { id: 'watches', translationKey: 'watches', icon: '⌚' }
];

const SORT_OPTIONS = [
  { id: 'popular', translationKey: 'sortByPopularity' },
  { id: 'price-asc', translationKey: 'sortByPriceAsc' },
  { id: 'price-desc', translationKey: 'sortByPriceDesc' },
  { id: 'rating', translationKey: 'sortByRating' }
];

export default function Shop() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const filter = useSelector((state) => state.products.filter);
  const searchQuery = useSelector((state) => state.products.searchQuery);
  const sortBy = useSelector((state) => state.products.sortBy);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const language = useSelector((state) => state.ui.language);
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    import('../services/firestore').then(({ subscribeToProducts }) => {
      if (!active) return;
      unsubscribe = subscribeToProducts(
        (products) => dispatch(replaceProducts(products)),
        (error) => dispatch(addToast({
          message: `${t('productsLoadFailed', language)} ${error.message}`,
          type: 'error'
        }))
      );
    }).catch((error) => {
      dispatch(addToast({
        message: `${t('productsConnectFailed', language)} ${error.message}`,
        type: 'error'
      }));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [dispatch, language]);

  // Фильтрация и сортировка с защитой от undefined
  const filteredProducts = products
    .filter(product => {
      // Защита от undefined/null
      if (!product || !product.category) return false;
      
      const matchesFilter = filter === 'all' || product.category === filter;
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  const handleAddToCart = (product) => {
    if (!product) return;
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      dispatch(addToast({ message: t('productAlreadyInCart', language), type: 'info' }));
    } else {
      dispatch(addToCart({ ...product, quantity: 1 }));
      dispatch(addToast({ message: `${product.name} ${t('addedToCart', language)}`, type: 'success' }));
    }
  };

  const handleToggleWishlist = (product) => {
    if (!product) return;
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      dispatch(addToast({ message: t('removedFromWishlist', language), type: 'info' }));
    } else {
      dispatch(addToWishlist(product));
      dispatch(addToast({ message: t('addedToWishlist', language), type: 'success' }));
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item?.id === productId);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('shopTitle', language)}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('shopSubtitle', language)}</p>
        </motion.div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>{t(option.translationKey, language)}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden px-4 py-3 bg-purple-600 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <Filter size={20} />
            {t('filters', language)}
          </button>
        </div>

        {/* Категории */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-8`}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(setFilter(category.id))}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filter === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-500'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {t(category.translationKey, language)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Результаты */}
        <div className="mb-4 text-gray-500 dark:text-gray-400">
          {t('productsFound', language)} <span className="font-bold text-purple-600">{filteredProducts.length}</span>
        </div>

        {/* Сетка товаров */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noProducts', language)}</h3>
            <p className="text-gray-500">{t('adjustSearch', language)}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => {
              // Дополнительная защита
              if (!product) return null;
              
              return (
                <motion.div
                  key={product.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  {/* Изображение */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name || t('noName', language)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(t('noImage', language))}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {t('noImage', language)}
                      </div>
                    )}
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full hover:scale-110 transition-transform"
                    >
                      <Heart
                        size={20}
                        className={
                          isInWishlist(product.id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-600 dark:text-gray-300'
                        }
                      />
                    </button>
                  </div>

                  {/* Контент */}
                  <div className="p-4">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1 uppercase">
                      {product.category ? t(product.category, language) : t('noCategory', language)}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {product.name || t('noName', language)}
                    </h3>
                    
                    {/* Рейтинг */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        {product.rating || 0}
                      </span>
                    </div>

                    {/* Цена и кнопка */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {(product.price || 0).toLocaleString()} ₽
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg"
                      >
                        <ShoppingCart size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}