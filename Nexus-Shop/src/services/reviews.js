import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

async function request(path, body) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to continue.');
  const token = await user.getIdToken();
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

export async function fetchProductReviews(productId) {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('productId', '==', String(productId)),
    limit(100),
  );
  const snapshot = await getDocs(reviewsQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => {
      const time = (value) => typeof value?.toDate === 'function' ? value.toDate().getTime() : Number(value) || 0;
      return time(b.createdAt) - time(a.createdAt);
    });
}

export async function hasCompletedPurchase(productId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)));
  return snapshot.docs.some((orderDoc) => {
    const order = orderDoc.data();
    const status = String(order.status || '').toLowerCase();
    return ['delivered', 'completed', 'доставлен'].includes(status)
      && Array.isArray(order.items)
      && order.items.some((item) => String(item.productId ?? item.id) === String(productId));
  });
}

export const submitProductReview = (review) => request('/api/reviews/save', review);
export const voteOnProductReview = ({ reviewId, value }) => request('/api/reviews/vote', { reviewId, value });
