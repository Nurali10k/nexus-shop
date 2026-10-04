import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { closeCart, removeFromCart, updateQuantity } from '../../store/slices/cartSlice'
import { t } from '../../i18n/translations'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { items, isOpen } = useSelector((state) => state.cart)
  const language = useSelector((state) => state.ui.language)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button type="button" aria-label="Закрыть корзину" className="absolute inset-0 h-full w-full bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch(closeCart())} />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween' }} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-5 shadow-xl dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('cart.title', language)}</h2>
              <button type="button" aria-label="Закрыть" onClick={() => dispatch(closeCart())}><X /></button>
            </div>
            {items.length === 0 ? <div className="grid flex-1 place-items-center text-gray-500"><div className="text-center"><ShoppingBag size={42} className="mx-auto mb-3" />{t('cart.empty', language)}</div></div> : (
              <>
                <div className="flex-1 space-y-4 overflow-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                      <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.price.toLocaleString('ru-RU')} ₽</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" aria-label="Уменьшить количество" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}><Minus size={15} /></button>
                          <span>{item.quantity}</span>
                          <button type="button" aria-label="Увеличить количество" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}><Plus size={15} /></button>
                          <button type="button" aria-label={t('cart.remove', language)} className="ml-auto text-red-500" onClick={() => dispatch(removeFromCart(item.id))}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="mb-4 flex justify-between font-bold"><span>{t('cart.total', language)}</span><span>{total.toLocaleString('ru-RU')} ₽</span></p>
                  <Link to="/checkout" onClick={() => dispatch(closeCart())} className="block w-full rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 text-center font-semibold text-white transition hover:shadow-lg">{t('cart.checkout', language)}</Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}