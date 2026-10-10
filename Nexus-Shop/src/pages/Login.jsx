import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginWithFirebase, clearError } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let active = true;
    import('../firebase').then(async ({ auth, getRedirectResult }) => {
      await auth.authStateReady();

      if (!active) return;

      const redirectResult = await getRedirectResult(auth);
      if (redirectResult?.user) {
        const user = redirectResult.user;
        dispatch(loginWithFirebase({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        }));
        navigate('/');
        return;
      }

      if (auth.currentUser) {
        const user = auth.currentUser;
        dispatch(loginWithFirebase({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        }));
        navigate('/');
      }
    }).catch((error) => {
      if (active) dispatch(addToast({ message: `Не удалось проверить Firebase: ${error.message}`, type: 'error' }));
    });

    return () => {
      active = false;
    };
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    dispatch(clearError());
    try {
      const { auth } = await import('../firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
      dispatch(loginWithFirebase({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL
      }));
      dispatch(addToast({ message: 'Вы вошли в аккаунт', type: 'success' }));
    } catch (error) {
      const messages = {
        'auth/invalid-credential': 'Неверный email или пароль.',
        'auth/user-not-found': 'Аккаунт с таким email не найден.',
        'auth/wrong-password': 'Неверный пароль.',
        'auth/operation-not-allowed': 'В Firebase не включён вход по email и паролю.',
        'auth/unauthorized-domain': `Домен ${window.location.hostname} не разрешён в Firebase. Добавьте его в Authentication → Settings → Authorized domains.`
      };
      dispatch(addToast({
        message: messages[error.code] || `Не удалось войти: ${error.message}`,
        type: 'error'
      }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { signInWithPopup, googleProvider, auth: firebaseAuth } = await import('../firebase');
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      dispatch(loginWithFirebase({ uid: user.uid, name: user.displayName, email: user.email, avatar: user.photoURL }));
      dispatch(addToast({ message: `Добро пожаловать, ${user.displayName}!`, type: 'success' }));
    } catch (error) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          const { signInWithRedirect, googleProvider, auth: firebaseAuth } = await import('../firebase');
          await signInWithRedirect(firebaseAuth, googleProvider);
          dispatch(addToast({ message: 'Google-авторизация открылась в новом окне. Вернитесь сюда после входа.', type: 'info' }));
          return;
        } catch (redirectError) {
          dispatch(addToast({ message: `Не удалось открыть Google-авторизацию: ${redirectError.message}`, type: 'error' }));
          return;
        }
      }

      const messages = {
        'auth/unauthorized-domain': `Домен ${window.location.hostname} не разрешён в Firebase. Добавьте его в Authentication → Settings → Authorized domains.`,
        'auth/popup-blocked': 'Браузер заблокировал окно Google. Разрешите всплывающие окна для сайта и проверьте Authorized domains в настройках Firebase.',
        'auth/popup-closed-by-user': 'Окно входа Google было закрыто до завершения авторизации.'
      };
      dispatch(addToast({
        message: messages[error.code] || `Не удалось войти через Google: ${error.message}`,
        type: 'error'
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-lg p-8 max-w-md w-full rounded-2xl border border-purple-500/30 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Вход в NEXUS</h1>
        
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.form onSubmit={handleSubmit} animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" placeholder="Введите ваш email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Введите пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <motion.button type="submit" whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(168, 85, 247, 0.4)" }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg transition-all">Войти →</motion.button>
        </motion.form>

        <div className="mt-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-transparent text-gray-400">ИЛИ ВОЙТИ ЧЕРЕЗ</span></div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-3 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-sm font-medium text-gray-300">Google</span>
            </motion.button>
          </div>
        </div>
        <p className="text-center mt-6 text-gray-400 text-sm">Нет аккаунта? <Link to="/register" className="text-purple-400 hover:underline font-semibold">Зарегистрироваться</Link></p>
      </motion.div>
    </div>
  );
}