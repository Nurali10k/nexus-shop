import { ShoppingCart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { t } from '../../i18n/translations'

export default function AddToCartButton({ product }) {
  const dispatch = useDispatch()
  const language = useSelector((state) => state.ui.language)

  const handleAdd = () => {
    dispatch(addToCart(product))
    dispatch(addToast({ message: `${product.name} — ${t('common.success', language)}`, type: 'success' }))
  }

  return (
    <button type="button" onClick={handleAdd} disabled={product.stock < 1} aria-label={`${t('product.addToCart', language)}: ${product.name}`} className="rounded-lg bg-primary-600 p-2 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
      <ShoppingCart size={18} />
    </button>
  )
}
