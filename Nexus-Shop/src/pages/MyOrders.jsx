import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { replaceOrders } from '../store/slices/ordersSlice';
import { addToast } from '../store/slices/uiSlice';
import { t } from '../i18n/translations';

export default function MyOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);
  const language = useSelector((state) => state.ui.language);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    Promise.all([
      import('../services/firestore'),
      import('../firebase')
    ]).then(async ([{ subscribeToOrders }, { auth }]) => {
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t('signInRequiredForOrder', language));
      }
      if (!active) return;
      setFirebaseUser(user);
      unsubscribe = subscribeToOrders(
        (items) => dispatch(replaceOrders(items)),
        (error) => dispatch(addToast({
          message: `${t('ordersLoadFailedAdmin', language)} ${error.message}`,
          type: 'error'
        })),
        user
      );
    }).catch((error) => {
      if (active) {
        dispatch(addToast({
          message: `${t('ordersLoadFailedAdmin', language)} ${error.message}`,
          type: 'error'
        }));
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [dispatch, language]);

  const statusLabels = {
    'Новый': t('statusNew', language),
    'В сборке': t('statusProcessing', language),
    'В пути': t('statusShipped', language),
    'Доставлен': t('statusDelivered', language),
    'Отменён': t('statusCancelled', language)
  };

  const myOrders = firebaseUser?.email === 'admin@nexus.com'
    ? orders
    : orders.filter(order => order.userId === firebaseUser?.uid);

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
          <h1 className="text-3xl font-bold mb-4">{t('noOrders', language)}</h1>
          <Link to="/shop" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg">
            {t('goToShop', language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8"
        >
          {t('orders', language)} ({myOrders.length})
        </motion.h1>

        <div className="space-y-4">
          {myOrders.slice().reverse().map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{t('orderLabel', language)} #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString(language === 'kg' ? 'ky-KG' : language === 'en' ? 'en-US' : 'ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(order.status)}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>

              {order.statusHistory && order.statusHistory.length > 1 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-bold mb-2">{t('orderHistory', language)}</p>
                  <div className="flex flex-wrap gap-2">
                    {order.statusHistory.map((h, i) => (
                      <span key={i} className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {statusLabels[h.status] || h.status} • {new Date(h.date).toLocaleTimeString(language === 'kg' ? 'ky-KG' : language === 'en' ? 'en-US' : 'ru-RU')}
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
                <span className="text-xl font-bold text-purple-600">{order.total.toLocaleString()} ₽</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}