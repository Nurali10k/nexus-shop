import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { store } from './store';
import { loadOrdersFromCloud } from './store/slices/ordersSlice';
import Header from './components/layout/Header';
import CartDrawer from './components/cart/CartDrawer';
import Toast from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import Dashboard from './pages/admin/Dashboard';

function AppContent() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Загружаем заказы из облака при старте
    dispatch(loadOrdersFromCloud());
  }, [theme, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
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
        </Routes>
      </main>
      <Toast />
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