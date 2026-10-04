import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { clearCart, removeFromCart, updateQuantity } from '../store/slices/cartSlice'
import { t } from '../i18n/translations'

export default function Cart() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)
  const language = useSelector((state) => state.ui.language)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!items.length) return <section className="page-shell py-20 text-center"><ShoppingBag size={54} className="mx-auto mb-5 text-gray-400" /><h1 className="mb-4 text-3xl font-bold">{t('cart.empty', language)}</h1><Link to="/shop" className="inline-block rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white">Перейти в магазин</Link></section>

  return (
    <section className="page-shell">
      <h1 className="mb-8 text-4xl font-bold">{t('cart.title', language)}</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="card flex gap-4 p-4">
              <Link to={`/product/${item.id}`}><img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" /></Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${item.id}`} className="font-semibold hover:text-primary-600">{item.name}</Link>
                <p className="mt-1 text-gray-500">{item.price.toLocaleString('ru-RU')} ₽</p>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" aria-label="Уменьшить" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label="Увеличить" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}><Plus size={16} /></button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button type="button" aria-label={t('cart.remove', language)} onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500"><Trash2 size={19} /></button>
                <strong>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</strong>
              </div>
            </article>
          ))}
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-xl font-bold">{t('cart.total', language)}</h2>
          <p className="mb-5 flex justify-between border-t border-gray-200 pt-4 text-lg font-bold dark:border-gray-700"><span>Итого</span><span>{total.toLocaleString('ru-RU')} ₽</span></p>
          <Link to="/checkout" className="block w-full rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 text-center font-semibold text-white transition hover:shadow-lg">{t('cart.checkout', language)}</Link>
          <button type="button" onClick={() => dispatch(clearCart())} className="mt-4 w-full text-sm text-red-500">Очистить корзину</button>
        </aside>
      </div>
    </section>
  )
}