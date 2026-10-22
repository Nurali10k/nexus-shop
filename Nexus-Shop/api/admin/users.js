import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices, requireAdmin } from '../_lib/firebaseAdmin.js';

const PAGE_SIZE = 50;

export default async function adminUsers(request, response) {
  try {
    const { auth, db } = getAdminServices();
    const admin = await requireAdmin(request, auth, db);
    if (!admin) return response.status(403).json({ error: 'Admin access required.' });

    if (request.method === 'GET') {
      const uid = String(request.query?.uid || '');
      if (uid) {
        const [profile, addresses, orders, wishlist, activity] = await Promise.all([
          db.collection('users').doc(uid).get(),
          db.collection('addresses').where('userId', '==', uid).limit(50).get(),
          db.collection('orders').where('userId', '==', uid).limit(20).get(),
          db.collection('wishlist').doc(uid).get(),
          db.collection('activity_feed').where('actorId', '==', uid).limit(20).get(),
        ]);
        if (!profile.exists) return response.status(404).json({ error: 'User not found.' });
        return response.status(200).json({
          profile: { uid: profile.id, ...profile.data() },
          addresses: addresses.docs.map((item) => ({ id: item.id, ...item.data() })),
          orders: orders.docs.map((item) => ({ id: item.id, ...item.data() })),
          wishlistCount: wishlist.data()?.productIds?.length || 0,
          activity: activity.docs.map((item) => ({ id: item.id, ...item.data() })),
        });
      }
      const cursor = String(request.query?.cursor || '');
      const base = db.collection('users').orderBy('createdAt', 'desc').limit(PAGE_SIZE + 1);
      const cursorSnapshot = cursor ? await db.collection('users').doc(cursor).get() : null;
      const page = cursorSnapshot?.exists ? await base.startAfter(cursorSnapshot).get() : await base.get();
      const hasMore = page.docs.length > PAGE_SIZE;
      const docs = page.docs.slice(0, PAGE_SIZE);
      return response.status(200).json({
        users: docs.map((item) => ({ uid: item.id, ...item.data() })),
        nextCursor: hasMore ? docs.at(-1)?.id || null : null,
      });
    }

    if (request.method === 'PATCH') {
      const uid = String(request.body?.uid || '');
      const patch = request.body?.patch || {};
      if (!uid || uid === admin.uid) return response.status(400).json({ error: 'Invalid target account.' });
      const allowed = {};
      if (patch.role === 'admin' || patch.role === 'customer') allowed.role = patch.role;
      if (typeof patch.isActive === 'boolean') allowed.isActive = patch.isActive;
      if (!Object.keys(allowed).length) return response.status(400).json({ error: 'No valid user changes provided.' });

      const userRef = db.collection('users').doc(uid);
      const beforeSnapshot = await userRef.get();
      if (!beforeSnapshot.exists) return response.status(404).json({ error: 'User not found.' });
      const before = beforeSnapshot.data();
      if (typeof allowed.isActive === 'boolean') {
        await auth.updateUser(uid, { disabled: !allowed.isActive });
        if (!allowed.isActive) await auth.revokeRefreshTokens(uid);
      }
      await userRef.set({ ...allowed, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      await db.collection('audit_logs').add({
        adminId: admin.uid,
        action: allowed.isActive === false ? 'ban_user' : allowed.role ? 'change_role' : 'update_user',
        targetType: 'user', targetId: uid, oldValue: { role: before.role, isActive: before.isActive },
        newValue: allowed, timestamp: FieldValue.serverTimestamp(),
      });
      return response.status(200).json({ uid, ...before, ...allowed });
    }

    if (request.method === 'POST') {
      const uid = String(request.body?.uid || '');
      const title = String(request.body?.title || '').trim();
      const message = String(request.body?.message || '').trim();
      if (!uid || !title || !message || title.length > 120 || message.length > 1000) {
        return response.status(400).json({ error: 'Provide a title and message (up to 1000 characters).' });
      }
      const notification = await db.collection('notifications').add({
        userId: uid, type: 'promo', title, message, read: false, createdAt: FieldValue.serverTimestamp(),
      });
      return response.status(201).json({ success: true, id: notification.id });
    }

    response.setHeader('Allow', 'GET, PATCH, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('[Admin users] Request failed:', error.message);
    return response.status(503).json({ error: 'Admin user request failed.' });
  }
}
