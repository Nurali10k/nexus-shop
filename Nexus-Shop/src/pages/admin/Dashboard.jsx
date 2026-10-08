import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Filter } from 'lucide-react';
import { updateOrderStatus, deleteOrder, setStatusFilter, loadOrders } from '../../store/slices/ordersSlice';
import { addToast } from '../../store/slices/uiSlice';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const STATUSES = ['all', 'Новый', 'В сборке', 'В пути', 'Доставлен', 'Отменён'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const orders = useSelector((state) => state.orders.items);
  const statusFilter = useSelector((state) => state.orders.statusFilter);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    dispatch(loadOrders());
  }, [dispatch]);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const stats = {
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
    products: products.length,
    customers: new Set(orders.map(o => o.userId)).size
  };

  const categoryData = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const statusCounts = STATUSES.filter(s => s !== 'all').map(s => ({
    name: s,
    count: orders.filter(o => o.status === s).length
  }));

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    dispatch(addToast({ message: `Статус обновлён: ${newStatus}`, type: 'success', id: Date.now() }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Новый': 'bg-blue-500',
      'В сборке': 'bg-yellow-500',
      'В пути': 'bg-purple-500',
      'Доставлен': 'bg-green-500',
      'Отменён': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const statCards = [
    { icon: DollarSign, label: 'Выручка', value: `${stats.revenue.toLocaleString()} ₽`, color: 'from-green-500 to-emerald-600' },
    { icon: ShoppingCart, label: 'Заказы', value: stats.orders, color: 'from-blue-500 to-cyan-600' },
    { icon: Package, label: 'Товары', value: stats.products, color: 'from-purple-500 to-pink-600' },
    { icon: Users, label: 'Клиенты', value: stats.customers, color: 'from-orange-500 to-red-600' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Панель управления</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'dashboard', label: 'Статистика' },
          { id: 'orders', label: 'Заказы' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-purple-500 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Заказы по статусам</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Товары по категориям</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'Все статусы' : s}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-center py-12 text-gray-500">Заказов не найдено</p>
          ) : (
            <div className="space-y-3">
              {filteredOrders.slice().reverse().map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">Заказ #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {order.name} • {order.phone}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm mb-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="inline-block mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold">{order.total.toLocaleString()} ₽</span>
                    <div className="flex gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      >
                        {STATUSES.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (confirm('Удалить заказ?')) {
                            dispatch(deleteOrder(order.id));
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}