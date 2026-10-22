import { loadEnv } from 'vite';
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices } from '../api/_lib/firebaseAdmin.js';

const env = loadEnv('development', process.cwd(), '');
for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']) {
  if (env[key]) process.env[key] = env[key];
}

const { auth, db } = getAdminServices();
const slugify = (value) => String(value || 'uncategorized').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized';

async function migrateProducts() {
  const products = await db.collection('products').get();
  let batch = db.batch();
  let writes = 0;
  let migrated = 0;
  const categories = new Map();
  for (const productDoc of products.docs) {
    const product = productDoc.data();
    const categoryId = slugify(product.categoryId || product.category);
    const categoryName = String(product.category || 'Uncategorized');
    categories.set(categoryId, categoryName);
    const patch = { categoryId, reviewCount: Number(product.reviewCount || 0), avgRating: Number(product.avgRating || 0), updatedAt: FieldValue.serverTimestamp() };
    if (product.rating !== undefined && Number.isFinite(Number(product.rating))) {
      patch.legacyRating = Number(product.rating);
      patch.rating = FieldValue.delete();
    }
    batch.set(productDoc.ref, patch, { merge: true });
    writes += 1;
    migrated += 1;
    if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
  }
  for (const [id, name] of categories) {
    batch.set(db.collection('categories').doc(id), { name, slug: id, parentId: null, description: '' }, { merge: true });
    writes += 1;
    if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
  }
  if (writes) await batch.commit();
  return migrated;
}

async function migrateUsers() {
  let nextPageToken;
  let migrated = 0;
  do {
    const page = await auth.listUsers(500, nextPageToken);
    const users = page.users;
    for (let offset = 0; offset < users.length; offset += 200) {
      const chunk = users.slice(offset, offset + 200);
      const refs = chunk.map((user) => db.collection('users').doc(user.uid));
      const snapshots = await db.getAll(...refs);
      const batch = db.batch();
      snapshots.forEach((snapshot, index) => {
        if (snapshot.exists) return;
        const user = chunk[index];
        batch.create(snapshot.ref, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email || '',
          photoURL: user.photoURL || null,
          role: user.email?.toLowerCase() === 'admin@nexus.com' ? 'admin' : 'customer',
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : FieldValue.serverTimestamp(),
          lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
          isActive: !user.disabled,
        });
        migrated += 1;
      });
      await batch.commit();
    }
    nextPageToken = page.pageToken;
  } while (nextPageToken);
  return migrated;
}

async function migrateOrders() {
  const orders = await db.collection('orders').get();
  let batch = db.batch();
  let writes = 0;
  const flushIfNeeded = async () => {
    if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
  };
  for (const orderDoc of orders.docs) {
    const order = orderDoc.data();
    const orderId = orderDoc.id;
    const linkedId = createHash('sha256').update(orderId).digest('hex');
    for (const [index, item] of (Array.isArray(order.items) ? order.items : []).entries()) {
      const itemId = createHash('sha256').update(`${orderId}:${index}`).digest('hex');
      batch.set(db.collection('order_items').doc(itemId), {
        orderId,
        userId: order.userId || '',
        productId: String(item.productId ?? item.id ?? ''),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price || 0),
        productName: String(item.name || ''),
        ...(item.image ? { image: item.image } : {}),
        ...(item.selectedVariantId ? { selectedVariantId: String(item.selectedVariantId) } : {}),
      }, { merge: true });
      writes += 1;
      await flushIfNeeded();
    }
    const paymentStatus = ['delivered', 'completed', 'доставлен'].includes(String(order.status || '').toLowerCase()) ? 'completed' : 'pending';
    const paymentMethod = ['card', 'crypto'].includes(String(order.payment || '').toLowerCase()) ? String(order.payment).toLowerCase() : 'cash';
    batch.update(orderDoc.ref, { paymentId: linkedId, shipmentId: linkedId });
    writes += 1;
    batch.set(db.collection('payments').doc(linkedId), {
      orderId,
      userId: order.userId || '',
      amount: Number(order.total || 0),
      currency: 'KGS',
      method: paymentMethod,
      status: paymentStatus,
      ...(paymentStatus === 'completed' ? { paidAt: order.updatedAt || order.createdAt || new Date() } : {}),
    }, { merge: true });
    batch.set(db.collection('shipments').doc(linkedId), {
      orderId,
      userId: order.userId || '',
      carrier: order.carrier || 'Unassigned',
      ...(order.trackingNumber ? { trackingNumber: String(order.trackingNumber) } : {}),
      currentStatus: String(order.status || 'pending'),
      history: (Array.isArray(order.statusHistory) ? order.statusHistory : []).map((entry) => ({
        status: String(entry.status || ''),
        timestamp: entry.date || entry.timestamp || new Date(),
        ...(entry.location ? { location: String(entry.location) } : {}),
      })),
    }, { merge: true });
    writes += 2;
    await flushIfNeeded();
  }
  if (writes) await batch.commit();
  return orders.size;
}

async function migrateReviewsAndSettings() {
  const [reviewsSnapshot, settingsSnapshot] = await Promise.all([
    db.collection('reviews').get(),
    db.collection('settings').doc('store').get(),
  ]);
  const aggregates = new Map();
  for (const reviewDoc of reviewsSnapshot.docs) {
    const review = reviewDoc.data();
    const productId = String(review.productId || '');
    if (!productId) continue;
    const aggregate = aggregates.get(productId) || { count: 0, total: 0 };
    aggregate.count += 1;
    aggregate.total += Number(review.rating || 0);
    aggregates.set(productId, aggregate);
  }
  let batch = db.batch();
  let writes = 0;
  for (const [productId, aggregate] of aggregates) {
    const avgRating = aggregate.count ? Math.round((aggregate.total / aggregate.count) * 100) / 100 : 0;
    batch.set(db.collection('products').doc(productId), { avgRating, reviewCount: aggregate.count }, { merge: true });
    writes += 1;
    if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
  }
  for (const reviewDoc of reviewsSnapshot.docs) {
    if (reviewDoc.data().verifiedPurchase !== undefined) continue;
    batch.update(reviewDoc.ref, { verifiedPurchase: false, images: Array.isArray(reviewDoc.data().images) ? reviewDoc.data().images : [] });
    writes += 1;
    if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
  }
  if (writes) await batch.commit();
  if (!settingsSnapshot.exists) {
    await db.collection('settings').doc('store').set({ siteName: 'NEXUS Shop', maintenanceMode: false, defaultCurrency: 'KGS', taxRate: 0, freeShippingThreshold: 0 });
  }
  return { reviews: reviewsSnapshot.size, productsWithReviews: aggregates.size };
}

const products = await migrateProducts();
const users = await migrateUsers();
const orders = await migrateOrders();
const reviewStats = await migrateReviewsAndSettings();
console.info('[Database migration] Complete:', { products, users, orders, ...reviewStats });
