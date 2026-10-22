import { createHash } from 'node:crypto';
import { getAdminServices, requireActiveUser } from '../_lib/firebaseAdmin.js';

export default async function voteOnReview(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  try {
    const { auth, db } = getAdminServices();
    const user = await requireActiveUser(request, auth, db);
    if (!user) return response.status(401).json({ error: 'Sign in to vote.' });
    const reviewId = String(request.body?.reviewId || '');
    const value = Number(request.body?.value);
    if (!reviewId || ![-1, 0, 1].includes(value)) return response.status(400).json({ error: 'Invalid vote.' });

    const reviewRef = db.collection('reviews').doc(reviewId);
    const voteId = createHash('sha256').update(`${reviewId}:${user.uid}`).digest('hex');
    const voteRef = db.collection('review_votes').doc(voteId);
    let helpfulVotes = 0;
    let currentVote = 0;
    await db.runTransaction(async (transaction) => {
      const [reviewSnapshot, voteSnapshot] = await Promise.all([transaction.get(reviewRef), transaction.get(voteRef)]);
      if (!reviewSnapshot.exists) throw Object.assign(new Error('Review not found.'), { statusCode: 404 });
      if (reviewSnapshot.data().userId === user.uid) {
        throw Object.assign(new Error('You cannot vote on your own review.'), { statusCode: 403 });
      }
      const oldValue = voteSnapshot.exists ? Number(voteSnapshot.data().value) || 0 : 0;
      helpfulVotes = Math.max(0, Number(reviewSnapshot.data().helpfulVotes || 0)
        + Number(value > 0) - Number(oldValue > 0));
      currentVote = value;
      transaction.update(reviewRef, { helpfulVotes });
      if (value === 0) transaction.delete(voteRef);
      else transaction.set(voteRef, { reviewId, userId: user.uid, value, updatedAt: Date.now() });
    });
    return response.status(200).json({ success: true, helpfulVotes, currentVote });
  } catch (error) {
    if (error.statusCode) return response.status(error.statusCode).json({ error: error.message });
    console.error('[Reviews] Vote failed:', error.message);
    return response.status(503).json({ error: 'Could not save vote.' });
  }
}
