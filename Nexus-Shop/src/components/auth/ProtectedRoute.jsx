import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { loginWithFirebase } from '../../store/slices/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { ensureUserProfile } from '../../services/collections';

// Проверяем реальную Firebase-сессию, а не только состояние Redux в браузере.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseRole, setFirebaseRole] = useState('customer');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    import('../../firebase').then(async ({ auth, db }) => {
      await auth.authStateReady();
      const signedInUser = auth.currentUser;
      if (!active) return;
      setFirebaseUser(signedInUser);
      let profile = null;
      if (signedInUser) {
        try {
          const profileSnapshot = await getDoc(doc(db, 'users', signedInUser.uid));
          profile = profileSnapshot.data() || null;
        } catch (error) {
          console.warn('[User profile] Could not read profile; continuing as customer:', error.message);
        }
        try {
          await ensureUserProfile(signedInUser);
        } catch (error) {
          console.warn('[User profile] Sync failed:', error.message);
        }
      }
      if (!active) return;
      setFirebaseRole(profile?.role || (signedInUser?.email === 'admin@nexus.com' ? 'admin' : 'customer'));
      if (signedInUser) dispatch(loginWithFirebase({
        uid: signedInUser.uid,
        name: signedInUser.displayName || signedInUser.email,
        email: signedInUser.email,
        avatar: signedInUser.photoURL,
        role: profile?.role,
        isActive: profile?.isActive,
      }));
      setChecking(false);
    }).catch((error) => {
      console.error('[Auth] Could not restore session:', error.message);
    }).finally(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, [dispatch]);

  if (checking) return <div className="p-8 text-center">Проверка доступа…</div>;
  if (!firebaseUser || !isAuthenticated) return <Navigate to="/login" replace />;
  if (firebaseUser && user?.isActive === false) return <Navigate to="/login" replace />;
  if (adminOnly && firebaseRole !== 'admin') return <Navigate to="/" replace />;
  return children;
}
