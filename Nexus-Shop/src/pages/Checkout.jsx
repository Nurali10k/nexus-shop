import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearCart } from '../store/slices/cartSlice';
import { addOrder } from '../store/slices/ordersSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/ui/Button';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1 - форма, 2 - подтверждение телефона
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    payment: 'card'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const sendTelegramNotification = async (order) => {
    const BOT_TOKEN = '8616800297:AAEc2fnbm-DyFOROL3gK12y-IMHgr52C5ZM';
    const CHAT_ID = '8234364151';
    
    const itemsText = order.items
      .map(i => `• ${i.name} (${i.quantity} шт.) — ${i.price * i.quantity} ₽`)
      .join('\n');
    
    const message = `🚀 *НОВЫЙ ЗАКАЗ NEXUS #${order.id}*\n\n` +
      `👤 *Клиент:* ${order.name}\n` +
      `📞 *Телефон:* ${order.phone}\n` +
      `📍 *Адрес:* ${order.address}\n\n` +
      `🛒 *Товары:*\n${itemsText}\n\n` +
      `💰 *ИТОГО:* ${order.total.toLocaleString()} ₽\n` +
      `💳 *Оплата:* ${order.payment === 'card' ? 'Карта' : 'Наличные'}\n` +
      `📊 *Статус:* Новый`;
    
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Telegram error:', error);
    }
  };

  const handlePhoneVerification = () => {
    // Генерируем 4-значный код
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setStep(2);
    
    // В реальном проекте здесь был бы SMS API
    alert(`Код подтверждения: ${code}\n(В реальном проекте код придёт по SMS)`);
  };

  const handleVerifyCode = () => {
    if (verificationCode !== generatedCode) {
      alert('Неверный код!');
      return;
    }

    const order = {
      id: Date.now(),
      userId: user?.id || null,
      ...form,
      items: cartItems,
      total,
      status: 'Новый',
      statusHistory: [{ status: 'Новый', date: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };

    dispatch(addOrder(order));
    sendTelegramNotification(order);
    dispatch(clearCart());
    dispatch(addToast({ message: 'Заказ оформлен! Уведомление отправлено.', type: 'success', id: Date.now() }));

    setTimeout(() => navigate('/my-orders'), 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
          <Button onClick={() => navigate('/shop')}>Перейти в магазин</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          {/* Прогресс бар */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-purple-500' : 'bg-gray-300'}`} />
            <div className={`flex-1 h-2 rounded mx-2 ${step >= 2 ? 'bg-purple-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex justify-between text-sm mb-8">
            <span className={step >= 1 ? 'text-purple-500 font-bold' : 'text-gray-400'}>Данные</span>
            <span className={step >= 2 ? 'text-purple-500 font-bold' : 'text-gray-400'}>Подтверждение</span>
          </div>

          <h1 className="text-3xl font-bold mb-6 neon-text">Оформление заказа</h1>

          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold mb-2">Ваш заказ:</h3>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
              </div>
            ))}
            <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between font-bold">
              <span>Итого:</span>
              <span className="neon-text">{total.toLocaleString()} ₽</span>
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
                  placeholder="Имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон (+996...)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Адрес доставки"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field"
                  required
                />
                <div>
                  <label className="block text-sm mb-2">Способ оплаты</label>
                  <select
                    value={form.payment}
                    onChange={(e) => setForm({ ...form, payment: e.target.value })}
                    className="input-field"
                  >
                    <option value="card">Банковская карта</option>
                    <option value="cash">Наличные при получении</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Продолжить →
                </Button>
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
                  <p className="text-sm">Код отправлен на номер <strong>{form.phone}</strong></p>
                  <p className="text-xs text-gray-500 mt-1">(В демо-версии код показан в alert)</p>
                </div>
                <input
                  type="text"
                  placeholder="Введите 4-значный код"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="input-field text-center text-2xl tracking-widest"
                  maxLength="4"
                  required
                />
                <div className="flex gap-2">
                  <Button onClick={() => setStep(1)} variant="secondary" className="flex-1">
                    Назад
                  </Button>
                  <Button onClick={handleVerifyCode} className="flex-1">
                    Подтвердить ✓
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}