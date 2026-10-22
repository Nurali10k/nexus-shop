import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { fetchAdminUsers, setUserPage, setUserRoleFilter, setUserSearch, setUserStatusFilter } from '../../store/slices/adminUsersSlice';
import UserDetailDrawer from './UserDetailDrawer';

const PAGE_SIZE = 10;
const copy = {
  ru: { searchLabel: 'Поиск пользователей', search: 'Имя или email', roleFilter: 'Фильтр по роли', allRoles: 'Все роли', customer: 'Покупатели', admins: 'Администраторы', statusFilter: 'Фильтр по статусу', allStatuses: 'Все статусы', activeFilter: 'Активные', blockedFilter: 'Заблокированные', user: 'Пользователь', role: 'Роль', status: 'Статус', registered: 'Регистрация', lastLogin: 'Последний вход', noName: 'Без имени', admin: 'Администратор', buyer: 'Покупатель', blocked: 'Заблокирован', active: 'Активен', loading: 'Загрузка пользователей…', notFound: 'Пользователи не найдены.', previous: 'Назад', next: 'Далее', loadMore: 'Загрузить ещё', loaded: 'загруженных', locale: 'ru-RU' },
  en: { searchLabel: 'Search users', search: 'Name or email', roleFilter: 'Filter by role', allRoles: 'All roles', customer: 'Customers', admins: 'Administrators', statusFilter: 'Filter by status', allStatuses: 'All statuses', activeFilter: 'Active', blockedFilter: 'Blocked', user: 'User', role: 'Role', status: 'Status', registered: 'Registered', lastLogin: 'Last sign in', noName: 'No name', admin: 'Administrator', buyer: 'Customer', blocked: 'Blocked', active: 'Active', loading: 'Loading users…', notFound: 'No users found.', previous: 'Previous', next: 'Next', loadMore: 'Load more', loaded: 'loaded', locale: 'en-US' },
  kg: { searchLabel: 'Колдонуучуларды издөө', search: 'Аты же email', roleFilter: 'Роль боюнча чыпка', allRoles: 'Бардык ролдор', customer: 'Кардарлар', admins: 'Администраторлор', statusFilter: 'Статус боюнча чыпка', allStatuses: 'Бардык статустар', activeFilter: 'Активдүү', blockedFilter: 'Бөгөттөлгөн', user: 'Колдонуучу', role: 'Роль', status: 'Статус', registered: 'Катталган', lastLogin: 'Акыркы кирүү', noName: 'Аты жок', admin: 'Администратор', buyer: 'Кардар', blocked: 'Бөгөттөлгөн', active: 'Активдүү', loading: 'Колдонуучулар жүктөлүүдө…', notFound: 'Колдонуучулар табылган жок.', previous: 'Мурунку', next: 'Кийинки', loadMore: 'Дагы жүктөө', loaded: 'жүктөлдү', locale: 'ky-KG' },
};

const dateLabel = (value, locale) => {
  const date = value?.toDate?.() || (value?._seconds ? new Date(value._seconds * 1000) : value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(locale) : '—';
};

export default function AdminUserTable() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.ui.language);
  const text = copy[language] || copy.ru;
  const { users, nextCursor, loading, initialized, error, search, role, status, page } = useSelector((state) => state.adminUsers);
  const [selected, setSelected] = useState(null);
  const toast = useCallback((message, type = 'info') => dispatch(addToast({ message, type })), [dispatch]);

  useEffect(() => { if (!initialized && !loading) dispatch(fetchAdminUsers()); }, [dispatch, initialized, loading]);

  const filtered = useMemo(() => users.filter((user) => {
    const queryText = search.trim().toLowerCase();
    const matchesSearch = !queryText || `${user.displayName || ''} ${user.email || ''}`.toLowerCase().includes(queryText);
    const matchesRole = role === 'all' || (user.role || 'customer') === role;
    const matchesStatus = status === 'all' || (status === 'active' ? user.isActive !== false : user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  }), [users, search, role, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    try { await dispatch(fetchAdminUsers(nextCursor)).unwrap(); }
    catch (loadError) { toast(loadError.message, 'error'); }
  };

  const rangeLabel = filtered.length
    ? language === 'en'
      ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} ${text.loaded}`
      : language === 'kg'
        ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length} ${text.loaded}`
        : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} из ${filtered.length} ${text.loaded}`
    : language === 'en' ? '0 users' : language === 'kg' ? '0 колдонуучу' : '0 пользователей';

  return (
    <section>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative block"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><span className="sr-only">{text.searchLabel}</span><input value={search} onChange={(event) => dispatch(setUserSearch(event.target.value))} placeholder={text.search} className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 dark:border-gray-700 dark:bg-gray-800" /></label>
        <label className="sr-only" htmlFor="user-role-filter">{text.roleFilter}</label><select id="user-role-filter" value={role} onChange={(event) => dispatch(setUserRoleFilter(event.target.value))} className="rounded-xl border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800"><option value="all">{text.allRoles}</option><option value="customer">{text.customer}</option><option value="admin">{text.admins}</option></select>
        <label className="sr-only" htmlFor="user-status-filter">{text.statusFilter}</label><select id="user-status-filter" value={status} onChange={(event) => dispatch(setUserStatusFilter(event.target.value))} className="rounded-xl border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800"><option value="all">{text.allStatuses}</option><option value="active">{text.activeFilter}</option><option value="blocked">{text.blockedFilter}</option></select>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-gray-800">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/60"><tr><th className="px-4 py-3">{text.user}</th><th className="px-4 py-3">{text.role}</th><th className="px-4 py-3">{text.status}</th><th className="px-4 py-3">{text.registered}</th><th className="px-4 py-3">{text.lastLogin}</th></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {visible.map((user) => <tr key={user.uid} className="cursor-pointer hover:bg-purple-50/60 dark:hover:bg-gray-700/60" onClick={() => setSelected(user)}>
              <td className="px-4 py-3"><button type="button" className="flex items-center gap-3 text-left"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-purple-100 font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">{user.photoURL ? <img src={user.photoURL} alt="" loading="lazy" className="h-full w-full object-cover" /> : (user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</span><span><strong className="block">{user.displayName || text.noName}</strong><span className="text-gray-500">{user.email}</span></span></button></td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>{user.role === 'admin' ? text.admin : text.buyer}</span></td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive === false ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>{user.isActive === false ? text.blocked : text.active}</span></td>
              <td className="px-4 py-3 text-gray-500">{dateLabel(user.createdAt, text.locale)}</td><td className="px-4 py-3 text-gray-500">{dateLabel(user.lastLoginAt, text.locale)}</td>
            </tr>)}
            {!visible.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><UsersIcon className="mx-auto mb-2" />{loading ? text.loading : text.notFound}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{rangeLabel}</p>
        <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => dispatch(setUserPage(page - 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700">{text.previous}</button><span className="px-2 py-2 text-sm">{page}/{pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => dispatch(setUserPage(page + 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700">{text.next}</button>{nextCursor && <button type="button" disabled={loading} onClick={loadMore} className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-40 dark:bg-gray-700">{loading ? text.loading : text.loadMore}</button>}</div>
      </div>
      {selected && <UserDetailDrawer user={selected} onClose={() => setSelected(null)} onToast={toast} />}
    </section>
  );
}
