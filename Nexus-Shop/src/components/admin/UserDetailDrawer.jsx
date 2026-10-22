import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../../firebase';
import { sendAdminUserNotification, updateAdminUser } from '../../store/slices/adminUsersSlice';

const dateLabel = (value) => {
  const date = value?.toDate?.() || (value?._seconds ? new Date(value._seconds * 1000) : value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '—';
};

export default function UserDetailDrawer({ user, onClose, onToast }) {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.adminUsers.saving);
  const currentAdminUid = useSelector((state) => state.auth.user?.id);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`/api/admin/users?uid=${encodeURIComponent(user.uid)}`, { headers: { Authorization: `Bearer ${token}` } });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Could not load user details.');
        if (active) setDetails(payload);
      } catch (error) { if (active) onToast(error.message, 'error'); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [user.uid, onToast]);

  const update = async (patch) => {
    try {
      await dispatch(updateAdminUser({ uid: user.uid, patch })).unwrap();
      setDetails((current) => current ? { ...current, profile: { ...current.profile, ...patch } } : current);
      onToast('Изменения сохранены.', 'success');
    } catch (error) { onToast(error.message, 'error'); }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(details || { profile: user }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nexus-user-${user.uid}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await dispatch(sendAdminUserNotification({ uid: user.uid, ...notice })).unwrap();
      setNotice({ title: '', message: '' });
      onToast('Уведомление отправлено.', 'success');
    } catch (error) { onToast(error.message, 'error'); }
    finally { setSending(false); }
  };

  const profile = details?.profile || user;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Профиль пользователя</p><h2 id="user-detail-title" className="text-2xl font-bold">{profile.displayName || profile.email}</h2></div>
          <div className="flex gap-2"><button type="button" onClick={exportData} aria-label="Экспортировать данные пользователя" className="rounded-lg border p-2 dark:border-gray-700"><Download size={18} /></button><button type="button" onClick={onClose} aria-label="Закрыть профиль" className="rounded-lg border p-2 dark:border-gray-700"><X size={18} /></button></div>
        </div>
        {loading ? <p className="py-10 text-center text-gray-500">Загрузка…</p> : <div className="space-y-5">
          <section className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <p>{profile.email}</p><p className="mt-1 text-sm text-gray-500">UID: {profile.uid}</p>
            <p className="mt-2 text-sm">Регистрация: {dateLabel(profile.createdAt)}</p><p className="text-sm">Последний вход: {dateLabel(profile.lastLoginAt)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={saving || currentAdminUid === user.uid} onClick={() => { const role = profile.role === 'admin' ? 'customer' : 'admin'; if (window.confirm(`Изменить роль пользователя на ${role}?`)) update({ role }); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-600">Сделать {profile.role === 'admin' ? 'покупателем' : 'администратором'}</button>
              <button type="button" disabled={saving || currentAdminUid === user.uid} onClick={() => update({ isActive: profile.isActive === false })} className={`rounded-lg px-3 py-2 text-sm text-white disabled:opacity-40 ${profile.isActive === false ? 'bg-emerald-600' : 'bg-red-600'}`}>{profile.isActive === false ? 'Разблокировать' : 'Заблокировать'}</button>
            </div>
          </section>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border p-4 dark:border-gray-700"><h3 className="mb-2 font-semibold">Адреса ({details?.addresses?.length || 0})</h3>{details?.addresses?.length ? details.addresses.map((address) => <p key={address.id} className="mb-2 text-sm text-gray-600 dark:text-gray-300">{address.label}: {address.street}, {address.city}, {address.country}</p>) : <p className="text-sm text-gray-500">Адресов пока нет.</p>}</section>
            <section className="rounded-2xl border p-4 dark:border-gray-700"><h3 className="mb-2 font-semibold">Избранное</h3><p className="text-sm text-gray-500">Товаров: {details?.wishlistCount || 0}</p></section>
          </div>
          <section className="rounded-2xl border p-4 dark:border-gray-700"><h3 className="mb-3 font-semibold">Последние заказы</h3>{details?.orders?.length ? details.orders.map((order) => <div key={order.id} className="flex justify-between border-t py-2 text-sm dark:border-gray-700"><span>#{order.id} · {order.status}</span><span>{Number(order.total || 0).toLocaleString()} сом</span></div>) : <p className="text-sm text-gray-500">Заказов пока нет.</p>}</section>
          <section className="rounded-2xl border p-4 dark:border-gray-700"><h3 className="mb-3 font-semibold">Активность</h3>{details?.activity?.length ? details.activity.slice(0, 8).map((item) => <p key={item.id} className="border-t py-2 text-sm dark:border-gray-700">{item.type} · {dateLabel(item.timestamp)}</p>) : <p className="text-sm text-gray-500">Событий пока нет.</p>}</section>
          <form onSubmit={sendNotification} className="space-y-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800"><h3 className="font-semibold">Отправить уведомление</h3><input value={notice.title} onChange={(event) => setNotice({ ...notice, title: event.target.value })} maxLength={120} required placeholder="Заголовок" className="w-full rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900" /><textarea value={notice.message} onChange={(event) => setNotice({ ...notice, message: event.target.value })} maxLength={1000} required rows={3} placeholder="Текст уведомления" className="w-full rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900" /><button disabled={sending} className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{sending ? 'Отправляем…' : 'Отправить'}</button></form>
        </div>}
      </aside>
    </div>
  );
}
