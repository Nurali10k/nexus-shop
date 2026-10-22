import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile } from './services/collections';
import { store } from './store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ToastContainer from './components/ui/ToastContainer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductPage from './pages/ProductPage';
import Dashboard from './pages/admin/Dashboard';

function AppContent() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui.theme);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) ensureUserProfile(firebaseUser).catch((error) => console.error('[User profile] Sync failed:', error.message));
  }), []);

  const getHomeRoute = () => {
    if (!isAuthenticated) return '/';
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}



