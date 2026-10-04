import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/ui/Button'
import { clearError, loginUser } from '../store/slices/authSlice'
import { addToast } from '../store/slices/uiSlice'
import { t } from '../i18n/translations'

export default function Login() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { error, loading, isAuthenticated } = useSelector((state) => state.auth)
  const { language } = useSelector((state) => state.ui)
  const [form, setForm] = useState({ email: '', password: '' })

  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/'} replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ id: Date.now(), message: `${result.payload.name}, добро пожаловать!`, type: 'success' }))
    }
  }

  return (
    <section className="page-shell flex justify-center py-14">
      <div className="card neon-border animate-glow w-full max-w-md p-8">
        <p className="mb-2 text-sm uppercase tracking-widest text-primary-600">NEXUS ACCOUNT</p>
        <h1 className="mb-6 text-3xl font-bold">{t('auth.login', language)}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
          <label className="block text-sm">{t('auth.email', language)}<input type="email" autoComplete="email" value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); if (error) dispatch(clearError()) }} className="input-field mt-2" required /></label>
          <label className="block text-sm">{t('auth.password', language)}<input type="password" autoComplete="current-password" value={form.password} onChange={(event) => { setForm({ ...form, password: event.target.value }); if (error) dispatch(clearError()) }} className="input-field mt-2" required /></label>
          <Button type="submit" disabled={loading} className="w-full">{loading ? t('common.loading', language) : t('auth.submit', language)}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">{t('auth.noAccount', language)} <Link to="/register" className="text-primary-600 hover:underline">{t('auth.register', language)}</Link></p>
        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">Демо-аккаунты хранятся только в этом браузере. Для настоящей авторизации нужен сервер.</p>
      </div>
    </section>
  )
}