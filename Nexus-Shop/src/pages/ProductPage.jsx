import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import StarRating from '../components/ui/StarRating'
import Button from '../components/ui/Button'
import { addToCart } from '../store/slices/cartSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { addToast } from '../store/slices/uiSlice'
import { t } from '../i18n/translations'

export default function ProductPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const product = useSelector((state) => state.products.items.find((item) => String(item.id) === id))
  const language = useSelector((state) => state.ui.language)
  const isInWishlist = useSelector((state) => state.wishlist.items.some((item) => item.id === product?.id))

  if (!product) return <section className="page-shell text-center"><h1 className="text-3xl font-bold">Товар не найден</h1><Link to="/shop" className="mt-4 inline-block text-primary-600">Вернуться в каталог</Link></section>

  const addProduct = () => {
    dispatch(addToCart(product))
    dispatch(addToast({ id: Date.now(), message: `${product.name} добавлен в корзину`, type: 'success' }))
  }

  return (
    <section className="page-shell">
      <Link to="/shop" className="mb-6 inline-block text-sm text-primary-600">← {t('shop.title', language)}</Link>
      <div className="grid gap-10 md:grid-cols-2">
        <img src={product.image} alt={product.name} className="max-h-[520px] w-full rounded-3xl object-cover" />
        <div className="py-4">
          <p className="mb-3 uppercase tracking-widest text-primary-600">{product.category}</p>
          <h1 className="mb-4 text-4xl font-bold">{product.name}</h1>
          <StarRating rating={product.rating} />
          <p className="my-7 leading-7 text-gray-600 dark:text-gray-300">{product.description}</p>
          <p className="mb-6 text-3xl font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
          <p className="mb-6 text-sm text-gray-500">{t('product.inStock', language)}: {product.stock}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={addProduct} disabled={product.stock < 1}><ShoppingCart className="mr-2 inline" size={18} />{t('product.addToCart', language)}</Button>
            <Button variant="secondary" onClick={() => dispatch(toggleWishlist(product))}><Heart className={`mr-2 inline ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} size={18} />{isInWishlist ? 'В избранном' : 'В избранное'}</Button>
          </div>
        </div>
      </div>
      <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">{t('product.reviews', language)}</h2><div className="card p-5"><StarRating rating={product.rating} /><p className="mt-2 text-gray-500">Средняя оценка покупателей.</p></div></section>
    </section>
  )
}