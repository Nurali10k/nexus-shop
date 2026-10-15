import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { closeCart } from '../../store/slices/cartSlice'
import { t } from '../../i18n/translations'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import CartEmptyState from './CartEmptyState'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { items, isOpen } = useSelector((state) => state.cart)
  const language = useSelector((state) => state.ui.language)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const close = () => dispatch(closeCart())

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button type="button" aria-label="Close cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-50 cursor-default bg-black/50 backdrop-blur-sm" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
            <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="flex items-center gap-2 text-xl font-bold"><ShoppingBag size={24} />{t('cart', language)} ({totalCount})</h2>
              <button type="button" aria-label="Close cart" onClick={close} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">×</button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.length ? items.map((item) => <CartItem key={item.id} item={item} />) : <CartEmptyState />}
            </div>
            {items.length > 0 && <CartSummary total={total} totalCount={totalCount} onCheckout={close} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
