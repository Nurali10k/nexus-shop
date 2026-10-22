import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices, requireActiveUser } from '../_lib/firebaseAdmin.js';

const completedStatuses = new Set(['delivered', 'completed', 'доставлен']);

export default async function saveReview(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  try {
    const { auth, db } = getAdminServices();
    const user = await requireActiveUser(request, auth, db);
    if (!user) return response.status(401).json({ error: 'Sign in to review products.' });

    const productId = String(request.body?.productId || '').trim();
    const comment = String(request.body?.comment ?? request.body?.text ?? '').trim();
    const rating = Number(request.body?.rating);
    const images = Array.isArray(request.body?.images) ? request.body.images : [];
    if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 1000) {
      return response.status(400).json({ error: 'Provide a product, a 1–5 rating, and a comment of at most 1000 characters.' });
    }
    const ownerStoragePath = encodeURIComponent(`review-images/${user.uid}/`);
    if (images.length > 3 || images.some((url) => typeof url !== 'string' || url.length > 2048
      || !url.startsWith('https://firebasestorage.googleapis.com/') || !url.includes(ownerStoragePath))) {
      return response.status(400).json({ error: 'Review images must be uploaded to Firebase Storage.' });
    }

    const orders = await db.collection('orders').where('userId', '==', user.uid).get();
    const verifiedPurchase = orders.docs.some((orderDoc) => {
      const order = orderDoc.data();
      return completedStatuses.has(String(order.status || '').toLowerCase())
        && Array.isArray(order.items)
        && order.items.some((item) => String(item.productId ?? item.id) === productId);
    });
    if (!verifiedPurchase) return response.status(403).json({ error: 'A completed purchase is required to review this product.' });

    const reviewId = createHash('sha256').update(`${productId}:${user.uid}`).digest('hex');
    const reviewRef = db.collection('reviews').doc(reviewId);
    const productRef = db.collection('products').doc(productId);
    const now = Date.now();
    let savedReviewId = reviewId;
    await db.runTransaction(async (transaction) => {
      const [reviewsSnapshot, productSnapshot, previousSnapshot] = await Promise.all([
        transaction.get(db.collection('reviews').where('productId', '==', productId)),
        transaction.get(productRef),
        transaction.get(reviewRef),
      ]);
      if (!productSnapshot.exists) throw Object.assign(new Error('Product not found.'), { statusCode: 404 });

      const existingReview = reviewsSnapshot.docs.find((item) => item.data().userId === user.uid);
      const existingData = existingReview?.data() || previousSnapshot.data() || {};
      const writeRef = existingReview?.ref || reviewRef;
      savedReviewId = writeRef.id;
      const currentReviews = reviewsSnapshot.docs.filter((item) => item.id !== writeRef.id);
      const ratingTotal = currentReviews.reduce((total, item) => total + (Number(item.data().rating) || 0), 0) + rating;
      const reviewCount = currentReviews.length + 1;
      transaction.set(writeRef, {
        productId,
        userId: user.uid,
        userName: user.name || user.email || 'Customer',
        userPhotoURL: user.picture || null,
        rating,
        comment,
        images,
        helpfulVotes: existingData.helpfulVotes || 0,
        verifiedPurchase: true,
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      });
      transaction.update(productRef, {
        avgRating: Math.round((ratingTotal / reviewCount) * 100) / 100,
        reviewCount,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    return response.status(200).json({ success: true, reviewId: savedReviewId });
  } catch (error) {
    if (error.statusCode) return response.status(error.statusCode).json({ error: error.message });
    console.error('[Reviews] Save failed:', error.message);
    return response.status(503).json({ error: 'Could not save review.' });
  }
}
