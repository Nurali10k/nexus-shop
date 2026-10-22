import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const COLLECTIONS = Object.freeze({
  users: 'users', addresses: 'addresses', wishlist: 'wishlist', preferences: 'user_preferences',
  categories: 'categories', brands: 'brands', tags: 'tags', variants: 'product_variants', inventory: 'inventory_logs',
  cart: 'cart_items', products: 'products', orders: 'orders', orderItems: 'order_items', payments: 'payments', shipments: 'shipments',
  invoices: 'invoices', returns: 'returns_requests', reviews: 'reviews', reviewVotes: 'review_votes',
  notifications: 'notifications', support: 'support_tickets', activity: 'activity_feed', settings: 'settings',
  analytics: 'analytics_daily', audit: 'audit_logs', promotions: 'promotions', chat: 'chat_messages',
});

export const getDomainCollection = (name) => collection(db, COLLECTIONS[name] || name);
export const getUserDocument = (uid) => doc(db, COLLECTIONS.users, uid);

const profileSyncs = new Map();
export function ensureUserProfile(user) {
  if (!user?.uid) return;
  if (profileSyncs.has(user.uid)) return profileSyncs.get(user.uid);
  const pending = (async () => {
    const userRef = getUserDocument(user.uid);
    const existing = await getDoc(userRef);
    const current = existing.data() || {};
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email || '',
      photoURL: user.photoURL || null,
      role: current.role === 'admin' || user.email?.toLowerCase() === 'admin@nexus.com' ? 'admin' : 'customer',
      createdAt: current.createdAt || serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: current.isActive !== false,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  })();
  profileSyncs.set(user.uid, pending);
  return pending.finally(() => profileSyncs.delete(user.uid));
}

export async function getCurrentUserToken() {
  if (!auth.currentUser) throw new Error('Sign in is required.');
  return auth.currentUser.getIdToken();
}
