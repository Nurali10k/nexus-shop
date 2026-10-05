import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toggleCart } from '../../store/slices/cartSlice';
import { setTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const cartItems = useSelector((state) => state.cart.items);
  const cartOpen = useSelector((state) => state.cart.isOpen);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui.theme);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold neon-text">NEXUS</Link>
        <Link to="/my-orders" className="hover:text-primary-500">Мои заказы</Link>
        <Link to="/support" className="hover:text-primary-500">Подержка</Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-primary-500 transition-colors">Главная</Link>
          <Link to="/shop" className="hover:text-primary-500 transition-colors">Магазин</Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-primary-500 transition-colors">Админ</Link>
          )}
        </nav>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* КНОПКА КОРЗИНЫ - САМОЕ ВАЖНОЕ */}
          <button 
            onClick={() => dispatch(toggleCart())} 
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block btn-primary px-4 py-2 text-sm">
              Войти
            </Link>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Главная</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Магазин</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Корзина ({cartCount})</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Избранное</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>
                <button onClick={handleLogout} className="text-left text-red-500">Выйти</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Войти</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}