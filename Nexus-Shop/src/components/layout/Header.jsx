import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, User, LogOut, ShoppingCart, Heart } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { addToast, setTheme, setLanguage } from '../../store/slices/uiSlice';
import BurgerMenu from './BurgerMenu';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, language } = useSelector((state) => state.ui);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const translations = {
    ru: { home: 'Главная', shop: 'Магазин', orders: 'Мои заказы', support: 'Поддержка', login: 'Войти', logout: 'Выйти', profile: 'Профиль', admin: 'Админ', logoutError: 'Не удалось выйти из Firebase:' },
    en: { home: 'Home', shop: 'Shop', orders: 'My Orders', support: 'Support', login: 'Login', logout: 'Logout', profile: 'Profile', admin: 'Admin', logoutError: 'Could not sign out of Firebase:' },
    kg: { home: 'Башкы', shop: 'Дүкөн', orders: 'Менин заказдар', support: 'Колдоо', login: 'Кирүү', logout: 'Чыгуу', profile: 'Профиль', admin: 'Админ', logoutError: 'Firebase аккаунтунан чыгуу мүмкүн болгон жок:' }
  };
  
  const t = translations[language] || translations.ru;

  const handleLogout = async () => {
    try {
      const { auth } = await import('../../firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      dispatch(addToast({ message: `${t.logoutError} ${error.message}`, type: 'error' }));
      return;
    }
    dispatch(logout());
    navigate('/');
    setShowProfile(false);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
          NEXUS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors">{t.home}</Link>
          <Link to="/shop" className="text-slate-300 hover:text-white transition-colors">{t.shop}</Link>
          {user && <Link to="/my-orders" className="text-slate-300 hover:text-white transition-colors">{t.orders}</Link>}
          <Link to="/support" className="text-slate-300 hover:text-white transition-colors">{t.support}</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language */}
          <select
            value={language}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ru">🇷🇺 RU</option>
            <option value="en">🇧 EN</option>
            <option value="kg">🇰🇬 KG</option>
          </select>

          {/* Theme */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
            <ShoppingCart size={20} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Profile */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0]}
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-700">
                      <p className="text-white font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg">
                        <User size={16} /> {t.profile}
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-slate-700 rounded-lg">
                          <User size={16} /> {t.admin}
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
                        <LogOut size={16} /> {t.logout}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              {t.login}
            </Link>
          )}

          <BurgerMenu
            open={mobileMenu}
            onToggle={() => setMobileMenu((open) => !open)}
            onNavigate={() => setMobileMenu(false)}
            links={[
              { to: '/', label: t.home },
              { to: '/shop', label: t.shop },
              { to: '/my-orders', label: t.orders, visible: Boolean(user) },
              { to: '/support', label: t.support },
              { to: '/admin', label: t.admin, visible: user?.role === 'admin' },
            ]}
          />
        </div>
      </div>

    </header>
  );
}
