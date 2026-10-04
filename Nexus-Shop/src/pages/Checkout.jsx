import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { clearCart } from '../store/slices/cartSlice'
import { addToast } from '../store/slices/uiSlice'
import { addOrder } from '../store/slices/ordersSlice'

export default function Checkout() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const existingOrders = useSelector((state) => state.orders.items)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notificationWarning, setNotificationWarning] = useState('')
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const nextOrderId = Math.max(0, ...existingOrders.map((order) => Number(order.id)).filter(Number.isSafeInteger)) + 1

  if (orderPlaced) return <section className="page-shell py-20 text-center"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl text-green-700">✓</div><h1 className="mb-3 text-3xl font-bold">Заказ оформлен!</h1><p className="mb-6 text-gray-500">Заказ сохранён в этом браузере. {user ? `Покупатель: ${user.name}.` : ''}</p>{notificationWarning && <p role="status" className="mx-auto mb-6 max-w-xl rounded-lg bg-amber-100 p-4 text-left text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{notificationWarning}</p>}<Link to="/shop" className="text-primary-600">Вернуться в каталог</Link></section>
  if (!items.length) return <section className="page-shell text-center"><h1 className="mb-4 text-3xl font-bold">Корзина пуста</h1><Link to="/shop" className="text-primary-600">Перейти в магазин</Link></section>

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const order = {
      id: nextOrderId,
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      payment: String(formData.get('payment') || 'card'),
      items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      total,
      status: 'Новый',
      createdAt: new Date().toISOString(),
    }

    dispatch(addOrder(order))
    let notificationSent = false
    try {
      const response = await fetch('/api/telegram/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      const isJson = response.headers.get('content-type')?.includes('application/json')
      if (response.ok && isJson) {
        notificationSent = true
      } else {
        const result = isJson ? await response.json() : {}
        setNotificationWarning(result.error || 'Уведомление не отправлено. Настройте Telegram API на сервере.')
      }
    } catch {
      setNotificationWarning('Сервис уведомлений недоступен. Заказ сохранён в демо-хранилище браузера.')
    }

    dispatch(clearCart())
    dispatch(addToast({
      id: order.id,
      message: notificationSent ? 'Заказ оформлен, уведомление отправлено' : 'Заказ оформлен',
      type: 'success',
    }))
    if (!notificationSent) console.warn('Order notification was not delivered; see the checkout warning.')
    setSubmitting(false)
    setOrderPlaced(true)
  }

  return (
    <section className="page-shell space-bg">
      <h1 className="mb-8 text-4xl font-bold">Оформление заказа</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <h2 className="text-xl font-bold">Данные получателя</h2>
          <label className="block text-sm">Имя<input name="name" autoComplete="name" defaultValue={user?.name || ''} minLength="2" maxLength="100" className="input-field mt-2" required /></label>
          <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" defaultValue={user?.email || ''} maxLength="254" className="input-field mt-2" required /></label>
          <label className="block text-sm">Адрес доставки<input name="address" autoComplete="street-address" minLength="5" maxLength="300" className="input-field mt-2" required /></label>
          <label className="block text-sm">Телефон<input name="phone" type="tel" autoComplete="tel" minLength="5" maxLength="40" className="input-field mt-2" required /></label>
          <label className="block text-sm">Способ оплаты<select name="payment" className="input-field mt-2"><option value="card">Банковская карта</option><option value="cash">Наличные при получении</option></select></label>
          <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Оформляем…' : `Подтвердить заказ — ${total.toLocaleString('ru-RU')} ₽`}</Button>
          <p className="text-xs text-gray-500">Демо-магазин: оплата не списывается. Данные заказа сохраняются локально; Telegram-уведомление работает только после настройки серверного API.</p>
        </form>
        <aside className="card h-fit p-6"><h2 className="mb-4 text-xl font-bold">Ваш заказ</h2>{items.map((item) => <p key={item.id} className="mb-2 flex justify-between gap-4 text-sm"><span>{item.name} × {item.quantity}</span><span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span></p>)}<p className="mt-4 border-t border-gray-200 pt-4 font-bold dark:border-gray-700">Итого: {total.toLocaleString('ru-RU')} ₽</p></aside>
      </div>
    </section>
  )
}