import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-gray-500 mb-6">Добавьте товары из каталога</p>
          <Link to="/shop" className="btn-primary inline-block">
            Перейти в магазин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Корзина ({items.length})</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 flex gap-4"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{item.category}</p>
                  <p className="text-primary-500 font-bold mt-1">{item.price.toLocaleString()} ₽</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => {
                      dispatch(removeFromCart(item.id));
                      dispatch(addToast({ message: 'Удалено из корзины', type: 'info', id: Date.now() }));
                    }}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                  <span className="font-bold text-lg">
                    {(item.price * item.quantity).toLocaleString()} ₽
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-4">Итого</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Товаров:</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 dark:border-gray-700">
                <span>К оплате:</span>
                <span className="neon-text">{total.toLocaleString()} ₽</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary block text-center">
              Оформить заказ →
            </Link>
            <button
              onClick={() => {
                if (confirm('Очистить корзину?')) {
                  dispatch(clearCart());
                }
              }}
              className="w-full mt-2 text-red-500 hover:text-red-600 text-sm py-2"
            >
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}