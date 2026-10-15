import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/ordersSlice';
import { addToast } from '../store/slices/uiSlice';
import { t } from '../i18n/translations';
import Input from '../components/ui/Input';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  const language = useSelector((state) => state.ui.language);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', payment: 'cash' });
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { auth } = await import('../firebase');
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error(t('signInRequiredForOrder', language));

      const order = {
        localUserId: auth.currentUser.uid,
        ...form,
        items: cartItems,
        total,
        status: 'Новый',
        statusHistory: [{ status: 'Новый', date: new Date().toISOString() }],
      };
      const createdOrder = await dispatch(createOrder(order)).unwrap();

      // Уведомления работают независимо: сбой Telegram не отменит отправку письма и заказ.
      await Promise.all([
        ['Telegram', '/api/telegram/order'],
        ['Email', '/api/email/order'],
      ].map(async ([channel, url]) => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdOrder),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          console.error(`[Checkout] Ошибка уведомления ${channel}:`, error);
        }
      }));

      dispatch(clearCart());
      dispatch(addToast({ message: t('orderPlaced', language), type: 'success' }));
      navigate('/my-orders');
    } catch (error) {
      dispatch(addToast({ message: `${t('orderFailed', language)} ${error.message || error}`, type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">{t('emptyCart', language)}</h2>
        <button onClick={() => navigate('/shop')} className="rounded-lg bg-purple-600 px-6 py-3 text-white">{t('goToShop', language)}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h1 className="mb-6 text-3xl font-bold">{t('checkoutTitle', language)}</h1>
          <div className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
            <h2 className="mb-2 font-bold">{t('yourOrder', language)}</h2>
            {cartItems.map((item) => <div key={item.id} className="flex justify-between py-1 text-sm"><span>{item.name} × {item.quantity}</span><span>{(item.price * item.quantity).toLocaleString()} сом</span></div>)}
            <div className="mt-2 flex justify-between border-t border-gray-300 pt-2 font-bold dark:border-gray-600"><span>{t('total', language)}:</span><span className="text-purple-600">{total.toLocaleString()} сом</span></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="text" placeholder={t('name', language)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="tel" placeholder={t('phonePlaceholder', language)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input type="text" placeholder={t('addressPlaceholder', language)} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
              <option value="cash">{t('payOnDelivery', language)}</option>
              <option value="card">{t('payByCard', language)} — демо, оплата при получении</option>
            </select>
            <button disabled={submitting} type="submit" className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white disabled:opacity-60">{submitting ? 'Отправка заказа…' : t('confirm', language)}</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
