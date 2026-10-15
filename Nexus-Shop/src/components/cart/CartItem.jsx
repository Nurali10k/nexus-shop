import { Minus, Plus, Trash2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import ProductImage from '../product/ProductImage'
import ProductPrice from '../product/ProductPrice'

export default function CartItem({ item }) {
  const dispatch = useDispatch()

  const removeItem = () => {
    dispatch(removeFromCart(item.id))
    dispatch(addToast({ message: 'Товар удалён из корзины.', type: 'info' }))
  }

  return (
    <article className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <ProductImage product={item} className="h-20 w-20 rounded-lg" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{item.name}</h3>
        <ProductPrice price={item.price} className="mt-1 text-sm text-primary-500" />
        <div className="mt-2 flex items-center gap-2">
          <button type="button" aria-label="Уменьшить количество" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700"><Minus size={14} /></button>
          <span className="w-8 text-center font-bold">{item.quantity}</span>
          <button type="button" aria-label="Увеличить количество" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700"><Plus size={14} /></button>
          <button type="button" aria-label="Удалить товар" onClick={removeItem} className="ml-auto rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  )
}
