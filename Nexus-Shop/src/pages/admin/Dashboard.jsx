import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Package, Users, Filter, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { replaceOrders, updateOrder, removeOrder, setStatusFilter } from '../../store/slices/ordersSlice';
import { replaceProducts, createProduct, updateProduct, removeProduct } from '../../store/slices/productsSlice';
import { addToast } from '../../store/slices/uiSlice';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const STATUSES = ['all', 'Новый', 'В сборке', 'В пути', 'Доставлен', 'Отменён'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const orders = useSelector((state) => state.orders.items);
  const statusFilter = useSelector((state) => state.orders.statusFilter);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'headphones', price: 0, rating: 5, image: '', description: '', stock: 0 });

  useEffect(() => {
    let active = true;
    let unsubscribeProducts = () => {};
    let unsubscribeOrders = () => {};

    Promise.all([
      import('../../services/firestore'),
      import('../../firebase')
    ]).then(async ([{ subscribeToProducts, subscribeToOrders, seedDefaultProductsIfEmpty }, { auth }]) => {
      if (!active) return;
      await auth.authStateReady();
      if (auth.currentUser?.email === 'admin@nexus.com') {
        try {
          await seedDefaultProductsIfEmpty();
        } catch (error) {
          dispatch(addToast({ message: `Не удалось заполнить каталог: ${error.message}`, type: 'error' }));
        }
      } else {
        dispatch(addToast({
          message: 'Для управления Firestore войдите через Google как admin@nexus.com.',
          type: 'info'
        }));
      }
      if (!active) return;
      unsubscribeProducts = subscribeToProducts(
        (items) => dispatch(replaceProducts(items)),
        (error) => dispatch(addToast({ message: `Не удалось загрузить товары: ${error.message}`, type: 'error' }))
      );
      unsubscribeOrders = subscribeToOrders(
        (items) => dispatch(replaceOrders(items)),
        (error) => dispatch(addToast({ message: `Не удалось загрузить заказы: ${error.message}`, type: 'error' }))
      );
    }).catch((error) => {
      dispatch(addToast({ message: `Не удалось подключиться к Firestore: ${error.message}`, type: 'error' }));
    });

    return () => {
      active = false;
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [dispatch]);

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const stats = {
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
    products: products.length,
    customers: new Set(orders.map(o => o.userId)).size
  };

  const categoryData = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const statusCounts = STATUSES.filter(s => s !== 'all').map(s => ({ name: s, count: orders.filter(o => o.status === s).length }));

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({ id: orderId, status: newStatus })).unwrap();
      dispatch(addToast({ message: `Статус обновлён: ${newStatus}`, type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: `Не удалось обновить статус: ${error.message}`, type: 'error' }));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, ...productForm })).unwrap();
        dispatch(addToast({ message: 'Товар обновлён', type: 'success' }));
      } else {
        await dispatch(createProduct(productForm)).unwrap();
        dispatch(addToast({ message: 'Товар добавлен', type: 'success' }));
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'headphones', price: 0, rating: 5, image: '', description: '', stock: 0 });
    } catch (error) {
      dispatch(addToast({ message: `Не удалось сохранить товар: ${error.message}`, type: 'error' }));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Удалить товар?')) {
      try {
        await dispatch(removeProduct(productId)).unwrap();
        dispatch(addToast({ message: 'Товар удалён', type: 'info' }));
      } catch (error) {
        dispatch(addToast({ message: `Не удалось удалить товар: ${error.message}`, type: 'error' }));
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm('Удалить заказ?')) {
      try {
        await dispatch(removeOrder(orderId)).unwrap();
        dispatch(addToast({ message: 'Заказ удалён', type: 'info' }));
      } catch (error) {
        dispatch(addToast({ message: `Не удалось удалить заказ: ${error.message}`, type: 'error' }));
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = { 'Новый': 'bg-blue-500', 'В сборке': 'bg-yellow-500', 'В пути': 'bg-purple-500', 'Доставлен': 'bg-green-500', 'Отменён': 'bg-red-500' };
    return colors[status] || 'bg-gray-500';
  };

  const statCards = [
    { icon: DollarSign, label: 'Выручка', value: `${stats.revenue.toLocaleString()} ₽`, color: 'from-green-500 to-emerald-600' },
    { icon: ShoppingCart, label: 'Заказы', value: stats.orders, color: 'from-blue-500 to-cyan-600' },
    { icon: Package, label: 'Товары', value: stats.products, color: 'from-purple-500 to-pink-600' },
    { icon: Users, label: 'Клиенты', value: stats.customers, color: 'from-orange-500 to-red-600' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Панель управления</h1>
        {activeTab === 'products' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingProduct(null); setProductForm({ name: '', category: 'headphones', price: 0, rating: 5, image: '', description: '', stock: 0 }); setShowProductModal(true); }} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus size={20} /> Добавить товар
          </motion.button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[{ id: 'dashboard', label: 'Статистика' }, { id: 'orders', label: 'Заказы' }, { id: 'products', label: 'Товары' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-semibold transition-all ${activeTab === tab.id ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500 hover:text-purple-500'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}><stat.icon className="text-white" size={24} /></div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Заказы по статусам</h2>
              <ResponsiveContainer width="100%" height={300}><BarChart data={statusCounts}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Товары по категориям</h2>
              <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>{pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} />
            <select value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
              {STATUSES.map(s => (<option key={s} value={s}>{s === 'all' ? 'Все статусы' : s}</option>))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredOrders.slice().reverse().map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">Заказ #{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.name} • {order.phone}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
                <div className="text-sm mb-2">{order.items.map((item, idx) => (<span key={idx} className="inline-block mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.name} x{item.quantity}</span>))}</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{order.total.toLocaleString()} ₽</span>
                  <div className="flex gap-2">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
                      {STATUSES.filter(s => s !== 'all').map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-100 dark:bg-gray-700"><img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} /></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">{product.price.toLocaleString()} ₽</span>
                    <span className="text-sm text-gray-500">⭐ {product.rating}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(product)} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"><Edit size={16} /> Ред.</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProductModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h3>
                <button onClick={() => setShowProductModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input type="text" placeholder="Название" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <option value="headphones">Наушники</option><option value="keyboards">Клавиатуры</option><option value="mice">Мыши</option><option value="watches">Часы</option>
                </select>
                <input type="number" placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                <input type="number" placeholder="Рейтинг (1-5)" value={productForm.rating} onChange={(e) => setProductForm({ ...productForm, rating: Number(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" min="1" max="5" step="0.1" />
                <input type="url" placeholder="URL изображения" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                <textarea placeholder="Описание" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                <input type="number" placeholder="Количество на складе" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Save size={20} /> {editingProduct ? 'Сохранить' : 'Добавить'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}