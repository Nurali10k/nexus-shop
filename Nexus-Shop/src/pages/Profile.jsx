import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { logout } from '../store/slices/authSlice'

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <section className="page-shell">
      <h1 className="mb-8 text-4xl font-bold">Профиль</h1>
      <div className="card max-w-xl p-6">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-100">{user?.name?.[0]?.toUpperCase()}</div>
        <dl className="space-y-4"><div><dt className="text-sm text-gray-500">Имя</dt><dd className="font-medium">{user?.name}</dd></div><div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div><div><dt className="text-sm text-gray-500">Тип аккаунта</dt><dd className="font-medium">{user?.role === 'admin' ? 'Администратор (демо)' : 'Покупатель'}</dd></div></dl>
        <Button variant="secondary" onClick={handleLogout} className="mt-6">Выйти</Button>
      </div>
    </section>
  )
}