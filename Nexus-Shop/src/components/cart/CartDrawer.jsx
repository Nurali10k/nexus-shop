import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          
          {/* Сама корзина */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Шапка */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag size={24} />
                Корзина ({totalCount})
              </h2>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Товары */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Корзина пуста</p>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="mt-4 text-primary-500 hover:underline"
                  >
                    Перейти в магазин
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-primary-500 font-bold text-sm mt-1">
                        {item.price.toLocaleString()} ₽
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => {
                            dispatch(removeFromCart(item.id));
                            dispatch(addToast({ message: 'Товар удалён', type: 'info', id: Date.now() }));
                          }}
                          className="ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Итого и кнопка */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Итого:</span>
                  <span className="text-2xl font-bold neon-text">{total.toLocaleString()} ₽</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-center hover:shadow-lg transition-all"
                >
                  Оформить заказ →
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Очистить корзину?')) {
                      dispatch(clearCart());
                      dispatch(addToast({ message: 'Корзина очищена', type: 'info', id: Date.now() }));
                    }
                  }}
                  className="w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                >
                  Очистить корзину
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}