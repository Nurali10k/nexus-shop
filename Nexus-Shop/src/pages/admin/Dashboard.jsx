import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Package, Users, Filter, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { replaceOrders, updateOrder, removeOrder, setStatusFilter } from '../../store/slices/ordersSlice';
import { replaceProducts, createProduct, updateProduct, removeProduct } from '../../store/slices/productsSlice';
import { addToast } from '../../store/slices/uiSlice';
import { t } from '../../i18n/translations';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import { formatProjectDate } from '../../utils/dates';
import AdminUserTable from '../../components/admin/AdminUserTable';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const STATUSES = ['all', 'reserved', 'Новый', 'В сборке', 'В пути', 'Доставлен', 'Отменён'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const orders = useSelector((state) => state.orders.items);
  const statusFilter = useSelector((state) => state.orders.statusFilter);
  const language = useSelector((state) => state.ui.language);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ordersPage, setOrdersPage] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'headphones', price: 0, image: '', description: '', stock: 0 });

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
          dispatch(addToast({ message: `${t('seedProductsFailed', language)} ${error.message}`, type: 'error' }));
        }
      } else {
        dispatch(addToast({
          message: t('adminAuthRequired', language),
          type: 'info'
        }));
      }
      if (!active) return;
      unsubscribeProducts = subscribeToProducts(
        (items) => dispatch(replaceProducts(items)),
        (error) => dispatch(addToast({ message: `${t('productsLoadFailedAdmin', language)} ${error.message}`, type: 'error' }))
      );
      unsubscribeOrders = subscribeToOrders(
        (items) => dispatch(replaceOrders(items)),
        (error) => dispatch(addToast({ message: `${t('ordersLoadFailedAdmin', language)} ${error.message}`, type: 'error' }))
      );
    }).catch((error) => {
      dispatch(addToast({       message: `${t('firestoreConnectFailed', language)} ${error.message}`, type: 'error' }));
    });

    return () => {
      active = false;
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [dispatch, language]);

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const orderedOrders = filteredOrders.slice().reverse();
  const lastOrdersPage = Math.max(1, Math.ceil(filteredOrders.length / 5));
  const visibleOrdersPage = Math.min(ordersPage, lastOrdersPage);
  const paginatedOrders = orderedOrders.slice((visibleOrdersPage - 1) * 5, visibleOrdersPage * 5);
  const stats = {
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
    products: products.length,
    customers: new Set(orders.map(o => o.userId)).size
  };

  const categoryData = products.reduce((acc, p) => {
    const categoryName = t(p.category, language);
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const statusLabel = (status) => {
    const keys = {
      all: 'statusAll',
      reserved: 'statusReserved',
      new: 'statusNew',
      processing: 'statusProcessing',
      shipped: 'statusShipped',
      delivered: 'statusDelivered',
      cancelled: 'statusCancelled',
      'Новый': 'statusNew',
      'В сборке': 'statusProcessing',
      'В пути': 'statusShipped',
      'Доставлен': 'statusDelivered',
      'Отменён': 'statusCancelled'
    };
    return keys[status] ? t(keys[status], language) : status;
  };
  const statusCounts = STATUSES.filter(s => s !== 'all').map(s => ({ name: statusLabel(s), count: orders.filter(o => o.status === s).length }));

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({ id: orderId, status: newStatus })).unwrap();
      dispatch(addToast({ message: `${t('statusUpdated', language)} ${statusLabel(newStatus)}`, type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: `${t('updateStatusFailed', language)} ${error.message}`, type: 'error' }));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.image.trim()) return;
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, ...productForm })).unwrap();
        dispatch(addToast({ message: t('productUpdated', language), type: 'success' }));
      } else {
        await dispatch(createProduct(productForm)).unwrap();
        dispatch(addToast({ message: t('productAdded', language), type: 'success' }));
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'headphones', price: 0, image: '', description: '', stock: 0 });
    } catch (error) {
      dispatch(addToast({ message: `${t('saveProductFailed', language)} ${error.message}`, type: 'error' }));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm(t('deleteProductConfirm', language))) {
      try {
        await dispatch(removeProduct(productId)).unwrap();
        dispatch(addToast({ message: t('productDeleted', language), type: 'info' }));
      } catch (error) {
        dispatch(addToast({ message: `${t('deleteProductFailed', language)} ${error.message}`, type: 'error' }));
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm(t('deleteOrderConfirm', language))) {
      try {
        await dispatch(removeOrder(orderId)).unwrap();
        dispatch(addToast({ message: t('orderDeleted', language), type: 'info' }));
      } catch (error) {
        dispatch(addToast({ message: `${t('deleteOrderFailed', language)} ${error.message}`, type: 'error' }));
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = { reserved: 'bg-purple-600', 'Новый': 'bg-blue-500', new: 'bg-blue-500', 'В сборке': 'bg-cyan-600', processing: 'bg-cyan-600', 'В пути': 'bg-indigo-500', shipped: 'bg-indigo-500', 'Доставлен': 'bg-emerald-600', delivered: 'bg-emerald-600', 'Отменён': 'bg-red-500', cancelled: 'bg-red-500' };
    return colors[status] || 'bg-gray-500';
  };

  const statCards = [
    { icon: DollarSign, label: t('adminRevenue', language), value: `${stats.revenue.toLocaleString()} сом`, color: 'from-green-500 to-emerald-600' },
    { icon: ShoppingCart, label: t('adminOrders', language), value: stats.orders, color: 'from-blue-500 to-cyan-600' },
    { icon: Package, label: t('adminProducts', language), value: stats.products, color: 'from-purple-500 to-pink-600' },
    { icon: Users, label: t('adminCustomers', language), value: stats.customers, color: 'from-orange-500 to-red-600' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t('adminDashboard', language)}</h1>
        {activeTab === 'products' && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingProduct(null); setProductForm({ name: '', category: 'headphones', price: 0, image: '', description: '', stock: 0 }); setShowProductModal(true); }} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus size={20} /> {t('addProduct', language)}
          </motion.button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[{ id: 'dashboard', label: t('adminStats', language) }, { id: 'orders', label: t('adminOrders', language) }, { id: 'products', label: t('adminProducts', language) }, { id: 'users', label: t('adminUsers', language) }].map(tab => (
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
              <h2 className="text-xl font-bold mb-4">{t('ordersByStatus', language)}</h2>
              <ResponsiveContainer width="100%" height={300}><BarChart data={statusCounts}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">{t('productsByCategory', language)}</h2>
              <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>{pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && <AdminUserTable />}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} />
            <select value={statusFilter} onChange={(e) => { setOrdersPage(1); dispatch(setStatusFilter(e.target.value)); }} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
              {STATUSES.map(s => (<option key={s} value={s}>{s === 'all' ? t('allStatuses', language) : statusLabel(s)}</option>))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredOrders.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-lg dark:bg-gray-800">
                {t('noOrdersAdmin', language)}
              </p>
            )}
            {paginatedOrders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-2xl border bg-white p-4 shadow-lg dark:bg-gray-800 ${order.status === 'reserved' ? 'border-purple-400/60 dark:border-purple-500/50' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{t('orderLabel', language)} #{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.name} • {order.phone}</p>
                    <p className="text-xs text-gray-400">{formatProjectDate(order.createdAt)}</p>
                    {order.reserveUntil && <p className="text-xs font-medium text-purple-600 dark:text-purple-300">{t('reservationUntil', language)}: {formatProjectDate(order.reserveUntil)}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${getStatusColor(order.status)}`}>{statusLabel(order.status)}</span>
                </div>
                <div className="text-sm mb-2">{order.items.map((item, idx) => (<span key={idx} className="inline-block mr-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.name} x{item.quantity}</span>))}</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{Number(order.total || 0).toLocaleString()} сом</span>
                  <div className="flex gap-2">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
                      {STATUSES.filter(s => s !== 'all').map(s => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                    </select>
                    <button type="button" aria-label={`${t('deleteOrderConfirm', language)} ${order.id}`} onClick={() => handleDeleteOrder(order.id)} className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination totalItems={filteredOrders.length} itemsPerPage={5} currentPage={visibleOrdersPage} onPageChange={setOrdersPage} />
        </motion.div>
      )}

      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-100 dark:bg-gray-700"><img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(t('noImage', language))}`; }} /></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{t(product.category, language)}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">{Number(product.price || 0).toLocaleString()} сом</span>
                    <span className="text-sm text-gray-500">★ {Number(product.avgRating || 0).toFixed(1)} ({Number(product.reviewCount || 0)})</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(product)} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"><Edit size={16} /> {t('editShort', language)}</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center" onClick={() => setShowProductModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{editingProduct ? t('editProduct', language) : t('addProduct', language)}</h3>
                <button onClick={() => setShowProductModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <Input type="text" placeholder={t('productName', language)} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <option value="headphones">{t('headphones', language)}</option><option value="keyboards">{t('keyboards', language)}</option><option value="mice">{t('mice', language)}</option><option value="watches">{t('watches', language)}</option>
                </select>
                <Input type="number" placeholder={t('price', language)} value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} required />
                <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>Ссылка на изображение товара</span>
                  <Input type="url" placeholder="https://example.com/product-image.jpg" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} required />
                  <span className="block text-xs font-normal text-gray-500">Вставьте прямую ссылку на изображение.</span>
                  {productForm.image && <img src={productForm.image} alt="Предпросмотр изображения товара" onError={(event) => { event.currentTarget.style.display = 'none'; }} onLoad={(event) => { event.currentTarget.style.display = 'block'; }} className="h-24 w-24 rounded-lg object-cover" />}
                </label>
                <Input as="textarea" placeholder={t('description', language)} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="3" required />
                <Input type="number" placeholder={t('stockQuantity', language)} value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} required />
                <button type="submit" disabled={!productForm.image.trim()} className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"><Save size={20} /> {editingProduct ? t('saveChanges', language) : t('add', language)}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
