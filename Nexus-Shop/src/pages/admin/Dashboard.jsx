import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
import { ORDER_STATUSES, updateOrderStatus } from '../../store/slices/ordersSlice'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const orders = useSelector((state) => state.orders.items)
  const categoryData = Object.values(products.reduce((categories, product) => {
    const current = categories[product.category] ?? { name: product.category, value: 0 }
    current.value += 1
    categories[product.category] = current
    return categories
  }, {}))
  const revenue = orders.filter((order) => order.status !== 'Отменён').reduce((sum, order) => sum + order.total, 0)
  const cards = [
    { label: 'Выручка по заказам', value: `${revenue.toLocaleString('ru-RU')} ₽`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Товаров в каталоге', value: products.length, icon: Package, color: 'text-violet-600' },
    { label: 'Заказы', value: orders.length, icon: ShoppingCart, color: 'text-cyan-600' },
    { label: 'Тип аккаунта', value: 'Демо', icon: Users, color: 'text-orange-600' },
  ]

  return (
    <section className="page-shell space-bg">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm uppercase tracking-widest text-primary-600">NEXUS / ADMIN</p><h1 className="text-4xl font-bold">Панель управления</h1></div><Link to="/admin/products" className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white">Управление товарами</Link></div>
      {import.meta.env.DEV && <p role="status" className="mb-6 rounded-lg border border-amber-400/40 bg-amber-100 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">Локальный демо-режим: любой вошедший пользователь может открыть эту панель. Не используйте эту проверку как защиту в production.</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => <article key={label} className="card p-5"><Icon className={color} size={25} /><p className="mt-4 text-sm text-gray-500">{label}</p><p className="text-2xl font-bold">{value}</p></article>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="card p-5"><h2 className="mb-4 text-lg font-bold">Количество товаров по категориям</h2><ResponsiveContainer width="100%" height={280}><BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></article>
        <article className="card p-5"><h2 className="mb-4 text-lg font-bold">Категории каталога</h2><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>{categoryData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></article>
      </div>
      <article className="card mt-8 overflow-hidden">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700"><h2 className="text-xl font-bold">Заказы и статусы</h2></div>
        {orders.length === 0 ? <p className="p-8 text-center text-gray-500">Заказов пока нет.</p> : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...orders].reverse().map((order) => (
              <div key={order.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-semibold">Заказ #{order.id}</h3>
                  <p className="text-sm text-gray-500">{order.name} · {order.phone} · {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="mt-1 text-sm">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                  <p className="mt-1 font-semibold">{order.total.toLocaleString('ru-RU')} ₽</p>
                </div>
                <label className="text-sm">Статус
                  <select value={ORDER_STATUSES.includes(order.status) ? order.status : ORDER_STATUSES[0]} onChange={(event) => dispatch(updateOrderStatus({ id: order.id, status: event.target.value }))} className="input-field mt-1 min-w-40">
                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </div>
            ))}
          </div>
        )}
      </article>
      <p className="mt-6 text-sm text-gray-500">Данные и статусы заказов хранятся только в localStorage этого браузера; это демонстрационная панель, не подключённая к серверу.</p>
    </section>
  )
}