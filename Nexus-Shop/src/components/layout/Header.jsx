import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LogOut, Menu, Moon, ShoppingCart, Sun, UserRound, X } from 'lucide-react'
import { toggleCart } from '../../store/slices/cartSlice'
import { setLanguage, setTheme, addToast } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'
import { t } from '../../i18n/translations'

const linkClass = ({ isActive }) => `transition hover:text-primary-500 ${isActive ? 'text-primary-600' : ''}`

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: cartItems } = useSelector((state) => state.cart)
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { theme, language } = useSelector((state) => state.ui)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(addToast({ id: Date.now(), message: t('nav.logout', language), type: 'success' }))
    navigate('/')
  }

  const navigation = (
    <>
      <NavLink to="/" className={linkClass} onClick={() => setMobileMenuOpen(false)}>{t('nav.home', language)}</NavLink>
      <NavLink to="/shop" className={linkClass} onClick={() => setMobileMenuOpen(false)}>{t('nav.shop', language)}</NavLink>
      {isAuthenticated && <NavLink to="/profile" className={linkClass} onClick={() => setMobileMenuOpen(false)}>{t('nav.profile', language)}</NavLink>}
      {user?.role === 'admin' && <NavLink to="/admin" className={linkClass} onClick={() => setMobileMenuOpen(false)}>{t('nav.admin', language)}</NavLink>}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-2xl font-black tracking-tight neon-text">NEXUS</Link>
        <nav className="hidden items-center gap-6 md:flex">{navigation}</nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <select aria-label="Язык" value={language} onChange={(event) => dispatch(setLanguage(event.target.value))} className="rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700">
            <option value="ru">RU</option><option value="en">EN</option><option value="kg">KG</option>
          </select>
          <button type="button" aria-label="Сменить тему" onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link to="/wishlist" aria-label={t('nav.wishlist', language)} className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Heart size={19} />
            {wishlistItems.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs text-white">{wishlistItems.length}</span>}
          </Link>
          <button type="button" aria-label={t('nav.cart', language)} onClick={() => dispatch(toggleCart())} className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-xs text-white">{cartCount}</span>}
          </button>
          {isAuthenticated ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/profile" aria-label={t('nav.profile', language)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><UserRound size={19} /></Link>
              <button type="button" aria-label={t('nav.logout', language)} onClick={handleLogout} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"><LogOut size={19} /></button>
            </div>
          ) : <Link to="/login" className="hidden rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white md:block">{t('nav.login', language)}</Link>}
          <button type="button" aria-label="Открыть меню" onClick={() => setMobileMenuOpen((open) => !open)} className="rounded-lg p-2 md:hidden">{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-4 overflow-hidden border-t border-gray-200 px-5 py-4 dark:border-gray-800 md:hidden">
            {navigation}
            {isAuthenticated ? <button type="button" onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="text-left text-red-500">{t('nav.logout', language)}</button> : <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{t('nav.login', language)}</Link>}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}