import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { auth, googleProvider, githubProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ensureUserProfile } from '../services/collections';
import { loginWithFirebase, clearError } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import { linkPendingGithubCredential, savePendingGithubCredential } from '../services/accountLinking';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const finishSignIn = async (firebaseUser) => {
    const { user } = await linkPendingGithubCredential(firebaseUser);
    dispatch(loginWithFirebase({ uid: user.uid, name: user.displayName, email: user.email, avatar: user.photoURL }));
    navigate('/');
    ensureUserProfile(user).catch((cause) => {
      console.error('[User profile] Sync failed:', cause.message);
      dispatch(addToast({ message: 'Вход выполнен, но профиль не синхронизирован. Опубликуйте актуальные Firestore rules.', type: 'error' }));
    });
  };

  useEffect(() => {
    let active = true;
    const restoreRedirect = async () => {
      await auth.authStateReady();
      const result = await getRedirectResult(auth);
      if (active && result?.user) await finishSignIn(result.user);
      else if (active && auth.currentUser) await finishSignIn(auth.currentUser);
    };
    restoreRedirect().catch((cause) => active && dispatch(addToast({ message: `Не удалось войти: ${cause.message}`, type: 'error' })));
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearError());
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      await finishSignIn(result.user);
      dispatch(addToast({ message: 'Вы вошли в аккаунт.', type: 'success' }));
    } catch (cause) {
      const messages = {
        'auth/invalid-credential': 'Неверный email или пароль.',
        'auth/user-not-found': 'Аккаунт с таким email не найден.',
        'auth/wrong-password': 'Неверный пароль.',
        'auth/operation-not-allowed': 'В Firebase не включён вход по email и паролю.',
      };
      dispatch(addToast({ message: messages[cause.code] || `Не удалось войти: ${cause.message}`, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider, name) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await finishSignIn(result.user);
      dispatch(addToast({ message: `Вход через ${name} выполнен.`, type: 'success' }));
    } catch (cause) {
      if (cause.code === 'auth/account-exists-with-different-credential' && savePendingGithubCredential(cause)) {
        dispatch(addToast({ message: 'Войдите прежним способом, чтобы связать аккаунт GitHub.', type: 'info' }));
      } else if (cause.code === 'auth/popup-blocked' || cause.code === 'auth/cancelled-popup-request') {
        try { await signInWithRedirect(auth, provider); }
        catch (redirectError) { dispatch(addToast({ message: `Не удалось открыть ${name}: ${redirectError.message}`, type: 'error' })); }
      } else {
        dispatch(addToast({ message: `Не удалось войти через ${name}: ${cause.message}`, type: 'error' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        <h1 className="mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-center text-3xl font-bold text-transparent">Вход в NEXUS</h1>
        {error && <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm text-red-200" role="alert"><AlertCircle size={17} />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-gray-300">Email
            <span className="relative mt-1 block"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} /><input type="email" autoComplete="email" placeholder="Введите ваш email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-purple-500" required /></span>
          </label>
          <label className="block text-sm text-gray-300">Пароль
            <span className="relative mt-1 block"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Введите пароль" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-purple-500" required /><button type="button" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShowPassword((shown) => !shown)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 py-3 font-bold text-white transition hover:shadow-lg disabled:opacity-60">{loading ? 'Входим…' : 'Войти'}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-white/20" />ИЛИ ВОЙТИ ЧЕРЕЗ<span className="h-px flex-1 bg-white/20" /></div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={loading} onClick={() => handleProviderLogin(googleProvider, 'Google')} className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-3 text-sm text-gray-200 transition hover:bg-white/10 disabled:opacity-60">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.38 37.98 46.98 31.9 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.99 23.99 0 0 0 0 21.56l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.94-2.13 15.92-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.19 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
            <span>Google</span>
          </button>
          <button type="button" disabled={loading} onClick={() => handleProviderLogin(githubProvider, 'GitHub')} className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-3 text-sm text-gray-200 transition hover:bg-white/10 disabled:opacity-60"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.11.08 1.7 1.14 1.7 1.14.99 1.7 2.61 1.21 3.25.93.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.12 2.95.71.78 1.14 1.78 1.14 3 0 4.29-2.61 5.24-5.1 5.51.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg><span>GitHub</span></button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-400">Нет аккаунта? <Link to="/register" className="font-semibold text-purple-400 hover:underline">Зарегистрироваться</Link></p>
      </motion.div>
    </div>
  );
}
