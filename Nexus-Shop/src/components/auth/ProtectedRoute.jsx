import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { loginWithFirebase } from '../../store/slices/authSlice';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [firebaseAdmin, setFirebaseAdmin] = useState(false);
  const [checkingFirebase, setCheckingFirebase] = useState(adminOnly);

  useEffect(() => {
    if (!adminOnly) return undefined;

    let active = true;
    import('../../firebase').then(async ({ auth }) => {
      await auth.authStateReady();
      if (active) {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          dispatch(loginWithFirebase({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL
          }));
        }
        setFirebaseAdmin(firebaseUser?.email === 'admin@nexus.com');
        setCheckingFirebase(false);
      }
    }).catch(() => {
      if (active) setCheckingFirebase(false);
    });

    return () => {
      active = false;
    };
  }, [adminOnly, dispatch]);

  if (adminOnly && checkingFirebase) {
    return <div className="p-8 text-center">Проверка доступа…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (user?.role !== 'admin' || !firebaseAdmin)) {
    return <Navigate to="/" replace />;
  }

  return children;
}