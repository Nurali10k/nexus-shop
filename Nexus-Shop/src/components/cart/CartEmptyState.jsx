import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { t } from '../../i18n/translations'

export default function CartEmptyState() {
  const language = useSelector((state) => state.ui.language)

  return (
    <div className="py-12 text-center">
      <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
      <p className="text-lg text-gray-500">{t('emptyCart', language)}</p>
      <Link to="/shop" className="mt-4 inline-block text-primary-500 hover:underline">{t('goToShop', language)}</Link>
    </div>
  )
}
