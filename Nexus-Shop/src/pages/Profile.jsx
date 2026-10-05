import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShoppingBag, LogOut, Eye, EyeOff } from 'lucide-react';
import { logout, updateProfile } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setProfileForm({ name: user.name, email: user.email });
      const savedOrders = JSON.parse(localStorage.getItem('nexus_orders') || '[]');
      setOrders(savedOrders.filter(o => o.userId === user.id));
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileForm));
    dispatch(addToast({ message: 'Профиль обновлён!', type: 'success', id: Date.now() }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Новые пароли не совпадают!');
      return;
    }
    
    if (passwordForm.current !== user.password) {
      alert('Текущий пароль неверный!');
      return;
    }
    
    if (passwordForm.new.length < 6) {
      alert('Пароль должен быть минимум 6 символов!');
      return;
    }
    
    dispatch(updateProfile({ password: passwordForm.new }));
    setPasswordForm({ current: '', new: '', confirm: '' });
    dispatch(addToast({ message: 'Пароль изменён!', type: 'success', id: Date.now() }));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-8"
        >
          {/* Шапка профиля */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Mail size={16} /> {user.email}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <LogOut size={16} /> Выйти
            </button>
          </div>

          {/* Табы */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User size={16} className="inline mr-2" />Профиль
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === 'password' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock size={16} className="inline mr-2" />Пароль
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={16} className="inline mr-2" />Заказы ({orders.length})
            </button>
          </div>

          {/* Контент табов */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Имя</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg transition-all">
                Сохранить изменения
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Текущий пароль</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm text-gray-300 mb-1">Новый пароль</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Подтвердите новый пароль</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg transition-all">
                Изменить пароль
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">У вас пока нет заказов</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white">Заказ #{order.id}</h3>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Новый' ? 'bg-blue-500' :
                        order.status === 'В сборке' ? 'bg-yellow-500' :
                        order.status === 'В пути' ? 'bg-purple-500' :
                        order.status === 'Доставлен' ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="inline-block mr-2 text-xs bg-white/10 px-2 py-1 rounded">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Итого: {order.total.toLocaleString()} ₽
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}