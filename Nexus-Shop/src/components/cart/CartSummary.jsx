import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import ProductPrice from '../product/ProductPrice'

export default function CartSummary({ total, totalCount, onCheckout }) {
  const dispatch = useDispatch()

  const handleClear = () => {
    if (!window.confirm('Очистить корзину?')) return
    dispatch(clearCart())
    dispatch(addToast({ message: 'Корзина очищена.', type: 'info' }))
  }

  return (
    <footer className="space-y-3 border-t border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between text-lg">
        <span className="font-semibold">Итого ({totalCount}):</span>
        <ProductPrice price={total} className="text-2xl neon-text" />
      </div>
      <Link to="/checkout" onClick={onCheckout} className="block w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 py-3 text-center font-bold text-white transition-all hover:shadow-lg">
        Оформить заказ →
      </Link>
      <button type="button" onClick={handleClear} className="w-full rounded-lg py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
        Очистить корзину
      </button>
    </footer>
  )
}
