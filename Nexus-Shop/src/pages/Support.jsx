import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { addMessage } from '../store/slices/supportSlice';
import { addToast } from '../store/slices/uiSlice';
import { askGemini } from '../services/geminiAI';

const faqData = [
  { q: 'Как оформить заказ?', a: 'Добавьте товары в корзину и нажмите "Оформить заказ"' },
  { q: 'Сколько длится доставка?', a: '1-3 дня по Бишкеку, 3-7 дней по регионам' },
  { q: 'Можно ли вернуть товар?', a: 'Да, в течение 14 дней с момента покупки' },
  { q: 'Какие способы оплаты?', a: 'Банковская карта или наличные при получении' },
  { q: 'Есть ли гарантия?', a: 'Да, официальная гарантия на все товары' }
];

export default function Support() {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.support.messages);
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Автопрокрутка вниз
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');

    // Добавляем сообщение пользователя
    dispatch(addMessage({
      text: userMsg,
      sender: user?.name || 'Гость',
      userId: user?.id || null,
      type: 'user'
    }));

    setIsLoading(true);

    try {
      // Запрашиваем ответ у Gemini
      const aiResponse = await askGemini(userMsg);

      // Добавляем ответ бота
      dispatch(addMessage({
        text: aiResponse,
        sender: 'NEXUS AI',
        type: 'bot'
      }));
    } catch (error) {
      dispatch(addMessage({
        text: 'Извините, произошла ошибка. Попробуйте позже.',
        sender: 'NEXUS AI',
        type: 'bot'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqClick = (question) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-text flex items-center justify-center gap-3">
            <Sparkles className="text-purple-500" size={40} />
            Служба поддержки NEXUS
          </h1>
          <p className="text-gray-400">AI-ассистент на базе Gemini 2.0 Flash</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* FAQ */}
          <div className="md:col-span-1">
            <div className="card p-4 sticky top-24">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={18} /> Частые вопросы
              </h3>
              <div className="space-y-2">
                {faqData.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFaqClick(item.q)}
                    className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-500/20 transition-all text-sm"
                  >
                    <p className="font-medium">{item.q}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-400">
                  💡 <strong>Совет:</strong> Нажмите на вопрос, чтобы быстро отправить его боту
                </p>
              </div>
            </div>
          </div>

          {/* Чат с AI */}
          <div className="md:col-span-2">
            <div className="card p-6 flex flex-col h-[600px]">
              {/* Шапка чата */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">NEXUS AI Assistant</h3>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Онлайн • Gemini 2.0 Flash
                  </p>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles size={40} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Привет! 👋</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      Я AI-ассистент NEXUS. Спросите меня о товарах, доставке, оплате или гарантии!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['Привет!', 'Как оформить заказ?', 'Сколько стоит доставка?'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleFaqClick(q)}
                          className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Bot size={16} className="text-white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] p-3 rounded-2xl ${
                        msg.type === 'user' 
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-sm' 
                          : 'bg-gray-100 dark:bg-gray-700 rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <User size={16} />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
                
                {/* Индикатор загрузки */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Поле ввода */}
              <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Напишите ваш вопрос..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field flex-1"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}