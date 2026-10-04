import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { store } from './store'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Toast from './components/ui/Toast'
import CartDrawer from './components/cart/CartDrawer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ThemeProvider from './context/ThemeContext'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminProducts from './pages/admin/AdminProducts'

const Dashboard = lazy(() => import('./pages/admin/Dashboard'))

function AppContent() {
  const theme = useSelector((state) => state.ui.theme)
  const language = useSelector((state) => state.ui.language)
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.lang = language
  }, [theme, language])

  return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            >
              <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Suspense fallback={<div className="page-shell">Загрузка панели…</div>}><Dashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="*" element={<div className="page-shell text-center"><h1 className="text-3xl font-bold">Страница не найдена</h1><Link className="mt-4 inline-block text-primary-600" to="/">На главную</Link></div>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Toast />
      <CartDrawer />
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
