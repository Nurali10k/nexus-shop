import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/ordersSlice';
import { addToast } from '../store/slices/uiSlice';
import { t } from '../i18n/translations';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  const language = useSelector((state) => state.ui.language);
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    payment: 'card'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePhoneVerification = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setStep(2);
    alert(t('demoVerificationCode', language).replace('{code}', code));
  };

  const handleVerifyCode = async () => {
    if (verificationCode !== generatedCode) {
      alert(t('invalidCode', language));
      return;
    }

    const order = {
      localUserId: user?.id || null,
      ...form,
      items: cartItems,
      total,
      status: 'Новый',
      statusHistory: [{ status: 'Новый', date: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };

    try {
      const { auth } = await import('../firebase');
      await auth.authStateReady();
      if (!auth.currentUser) {
        throw new Error(t('signInRequiredForOrder', language));
      }
      console.info('[Checkout] Отправка заказа', {
        itemCount: cartItems.length,
        total,
        authenticated: true
      });
      const createdOrder = await dispatch(createOrder(order)).unwrap();
      console.info('[Checkout] Заказ сохранён', { id: createdOrder.id });
      dispatch(clearCart());
      dispatch(addToast({ message: t('orderPlaced', language), type: 'success' }));

      setTimeout(() => navigate('/my-orders'), 1000);
    } catch (error) {
      console.error('[Checkout] Ошибка оформления заказа', {
        code: error.code,
        message: error.message || String(error)
      });
      dispatch(addToast({
        message: `${t('orderFailed', language)} ${error.message || String(error)}${error.code ? ` (${error.code})` : ''}`,
        type: 'error'
      }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('emptyCart', language)}</h2>
          <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-purple-600 text-white rounded-lg">
            {t('goToShop', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6">{t('checkoutTitle', language)}</h1>

          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold mb-2">{t('yourOrder', language)}</h3>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
              </div>
            ))}
            <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between font-bold">
              <span>{t('total', language)}:</span>
              <span className="text-purple-600">{total.toLocaleString()} ₽</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={(e) => { e.preventDefault(); handlePhoneVerification(); }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder={t('name', language)}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  required
                />
                <input
                  type="tel"
                  placeholder={t('phonePlaceholder', language)}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  required
                />
                <input
                  type="text"
                  placeholder={t('addressPlaceholder', language)}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  required
                />
                <select
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value="card">{t('payByCard', language)}</option>
                  <option value="cash">{t('payOnDelivery', language)}</option>
                </select>
                <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold">
                  {t('continue', language)}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm">{t('codeSentTo', language)} <strong>{form.phone}</strong></p>
                </div>
                <input
                  type="text"
                  placeholder={t('enterCode', language)}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-2xl tracking-widest"
                  maxLength="4"
                  required
                />
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-600 text-white rounded-lg">
                    {t('back', language)}
                  </button>
                  <button onClick={handleVerifyCode} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold">
                    {t('confirm', language)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}