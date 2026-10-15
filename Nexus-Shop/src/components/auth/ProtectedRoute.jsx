import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { loginWithFirebase } from '../../store/slices/authSlice';

// Проверяем реальную Firebase-сессию, а не только состояние Redux в браузере.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    import('../../firebase').then(async ({ auth }) => {
      await auth.authStateReady();
      const signedInUser = auth.currentUser;
      if (!active) return;
      setFirebaseUser(signedInUser);
      if (signedInUser) dispatch(loginWithFirebase({
        uid: signedInUser.uid,
        name: signedInUser.displayName || signedInUser.email,
        email: signedInUser.email,
        avatar: signedInUser.photoURL,
      }));
      setChecking(false);
    }).catch(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, [dispatch]);

  if (checking) return <div className="p-8 text-center">Проверка доступа…</div>;
  if (!firebaseUser || !isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && (firebaseUser.email !== 'admin@nexus.com' || user?.role !== 'admin')) return <Navigate to="/" replace />;
  return children;
}
