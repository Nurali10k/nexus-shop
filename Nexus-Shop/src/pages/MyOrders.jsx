import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';

export default function MyOrders() {
  const orders = useSelector((state) => state.orders.items);
  const { user } = useSelector((state) => state.auth);

  // Фильтруем заказы текущего пользователя
  const myOrders = user 
    ? orders.filter(o => o.userId === user.id)
    : orders;

  const getStatusIcon = (status) => {
    const icons = {
      'Новый': <Clock size={20} className="text-blue-500" />,
      'В сборке': <Package size={20} className="text-yellow-500" />,
      'В пути': <Truck size={20} className="text-purple-500" />,
      'Доставлен': <CheckCircle size={20} className="text-green-500" />,
      'Отменён': <XCircle size={20} className="text-red-500" />
    };
    return icons[status] || <Clock size={20} />;
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

  if (myOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">У вас нет заказов</h1>
          <Link to="/shop" className="btn-primary inline-block">
            Перейти в магазин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 neon-text"
        >
          Мои заказы ({myOrders.length})
        </motion.h1>

        <div className="space-y-4">
          {myOrders.slice().reverse().map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Заказ #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* История статусов */}
              {order.statusHistory && order.statusHistory.length > 1 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-bold mb-2">История:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.statusHistory.map((h, i) => (
                      <span key={i} className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {h.status} • {new Date(h.date).toLocaleTimeString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-sm text-gray-500">{order.name} • {order.phone}</p>
                  <p className="text-xs text-gray-400">{order.address}</p>
                </div>
                <span className="text-xl font-bold neon-text">{order.total.toLocaleString()} ₽</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}