import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { reserveProduct } from '../../store/slices/ordersSlice'
import { addToast } from '../../store/slices/uiSlice'

const messages = {
  ru: { label: 'Забронировать', login: 'Сначала войдите в аккаунт, чтобы забронировать товар.', success: 'Товар забронирован на 24 часа.', error: 'Не удалось забронировать товар.' },
  en: { label: 'Reserve', login: 'Sign in to reserve this product.', success: 'Product reserved for 24 hours.', error: 'Could not reserve this product.' },
  kg: { label: 'Брондоо', login: 'Товарды брондоо үчүн аккаунтка кириңиз.', success: 'Товар 24 саатка брондолду.', error: 'Товарды брондоо ишке ашкан жок.' },
}

export default function ReserveButton({ product }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const language = useSelector((state) => state.ui.language)
  const [isReserving, setIsReserving] = useState(false)
  const copy = messages[language] || messages.ru

  // Бронь создаётся через Redux thunk и сохраняется в Firestore.
  const handleReserve = async () => {
    if (!user?.id) {
      dispatch(addToast({ message: copy.login, type: 'info' }))
      return
    }

    setIsReserving(true)
    try {
      await dispatch(reserveProduct(product)).unwrap()
      dispatch(addToast({ message: copy.success, type: 'success' }))
    } catch (error) {
      dispatch(addToast({ message: error.message || copy.error, type: 'error' }))
    } finally {
      setIsReserving(false)
    }
  }

  return (
    <button type="button" onClick={handleReserve} disabled={product.stock < 1 || isReserving} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50">
      {isReserving ? '…' : copy.label}
    </button>
  )
}
