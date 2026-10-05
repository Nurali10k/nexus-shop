import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Список избранного пуст</h1>
          <Link to="/shop" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">
            Перейти в магазин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Избранное ({items.length})
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-purple-500/30 hover:border-purple-500/80 transition-all hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg text-white mb-1 hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mb-2 capitalize">{product.category}</p>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">{product.rating}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    {product.price.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      dispatch(addToCart(product));
                      dispatch(addToast({ message: `${product.name} добавлен в корзину`, type: 'success', id: Date.now() }));
                    }}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1"
                  >
                    <ShoppingCart size={16} /> В корзину
                  </button>
                  <button
                    onClick={() => dispatch(toggleWishlist(product))}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}