import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/ui/Button'
import { clearError, registerUser } from '../store/slices/authSlice'
import { addToast } from '../store/slices/uiSlice'
import { t } from '../i18n/translations'

export default function Register() {
  const dispatch = useDispatch()
  const { error, loading, isAuthenticated } = useSelector((state) => state.auth)
  const { language } = useSelector((state) => state.ui)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  if (isAuthenticated) return <Navigate to="/profile" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      dispatch(clearError())
      return
    }
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      dispatch(addToast({ id: Date.now(), message: 'Аккаунт создан', type: 'success' }))
    }
  }

  return (
    <section className="page-shell flex justify-center py-14">
      <div className="card neon-border animate-glow w-full max-w-md p-8">
        <p className="mb-2 text-sm uppercase tracking-widest text-primary-600">NEXUS ACCOUNT</p>
        <h1 className="mb-6 text-3xl font-bold">{t('auth.register', language)}</h1>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
        {form.confirmPassword && form.password !== form.confirmPassword && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">Пароли не совпадают.</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">{t('auth.name', language)}<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" className="input-field mt-2" minLength="2" required /></label>
          <label className="block text-sm">{t('auth.email', language)}<input type="email" value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); if (error) dispatch(clearError()) }} autoComplete="email" className="input-field mt-2" required /></label>
          <label className="block text-sm">{t('auth.password', language)}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" minLength="8" className="input-field mt-2" required /></label>
          <label className="block text-sm">Подтвердите пароль<input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} autoComplete="new-password" minLength="8" className="input-field mt-2" required /></label>
          <Button type="submit" disabled={loading || form.password !== form.confirmPassword} className="w-full">{loading ? t('common.loading', language) : t('auth.submit', language)}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">{t('auth.haveAccount', language)} <Link to="/login" className="text-primary-600 hover:underline">{t('auth.login', language)}</Link></p>
      </div>
    </section>
  )
}