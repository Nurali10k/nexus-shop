import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { defaultProducts } from "../store/defaultProducts";

const categorySlug = (value) => String(value || 'uncategorized').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized';
const withFirestoreRulesHint = (error, action) => {
  const permissionDenied = error?.code === 'permission-denied'
    || String(error?.message || '').toLowerCase().includes('missing or insufficient permissions');
  if (!permissionDenied) return error;
  return new Error(`Firebase rules blocked ${action}. Publish the current firestore.rules from Nexus-Shop: firebase deploy --only firestore:rules,firestore:indexes,storage.`);
};

export const seedDefaultProductsIfEmpty = async () => {
  if (auth.currentUser?.email !== 'admin@nexus.com') return false;

  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  if (!snapshot.empty) return false;

  const batch = writeBatch(db);
  const categories = new Map();
  defaultProducts.forEach(({ id, ...product }) => {
    const categoryId = categorySlug(product.category);
    categories.set(categoryId, product.category);
    batch.set(doc(productsRef, `default-${id}`), { ...product, categoryId, avgRating: 0, reviewCount: 0 });
  });
  categories.forEach((name, id) => batch.set(doc(db, 'categories', id), { name, slug: id, parentId: null }, { merge: true }));
  await batch.commit();
  return true;
};

// ===== ТОВАРЫ =====
export const getProductsFromFirestore = async () => {
  const productsRef = collection(db, "products");
  const querySnapshot = await getDocs(productsRef);
  if (querySnapshot.empty) return defaultProducts;
  return querySnapshot.docs.map(productDoc => ({
    id: productDoc.id,
    ...productDoc.data()
  }));
};

export const subscribeToProducts = (onData, onError) => {
  const productsRef = collection(db, "products");
  const unsubscribe = onSnapshot(
    productsRef,
    productsSnapshot => {
      const products = productsSnapshot.docs.map(productDoc => ({
          id: productDoc.id,
          ...productDoc.data()
      }));
      onData(products.length > 0 ? products : defaultProducts);
    },
    onError
  );

  return unsubscribe;
};

export const addProductToFirestore = async (product) => {
  const categoryId = categorySlug(product.category);
  const docRef = await addDoc(collection(db, "products"), { ...product, categoryId, avgRating: 0, reviewCount: 0 });
  await setDoc(doc(db, 'categories', categoryId), { name: product.category, slug: categoryId, parentId: null }, { merge: true });
  return docRef.id;
};

export const updateProductInFirestore = async (id, product) => {
  const categoryId = categorySlug(product.category);
  await updateDoc(doc(db, "products", String(id)), { ...product, categoryId });
  await setDoc(doc(db, 'categories', categoryId), { name: product.category, slug: categoryId, parentId: null }, { merge: true });
};

export const deleteProductFromFirestore = async (id) => {
  await deleteDoc(doc(db, "products", String(id)));
};

// ===== ЗАКАЗЫ =====
const getVisibleOrdersQuery = async (user = auth.currentUser) => {
  if (!user) {
    throw new Error('Войдите через Firebase, чтобы просматривать заказы.');
  }

  const ordersRef = collection(db, "orders");
  let isAdmin = user.email?.toLowerCase() === 'admin@nexus.com';
  try {
    const cachedUser = JSON.parse(localStorage.getItem('nexus_current_user') || 'null');
    isAdmin ||= cachedUser?.id === user.uid && cachedUser?.role === 'admin';
  } catch { /* Firestore still enforces admin access to an unfiltered query. */ }
  try {
    const userProfile = await getDoc(doc(db, 'users', user.uid));
    isAdmin ||= userProfile.data()?.role === 'admin';
  } catch (error) {
    // A profile read failure should not prevent customers from reading their own orders.
    console.warn('[Firestore] Could not read user role; loading only this account’s orders:', error.message);
  }
  return isAdmin ? ordersRef : query(ordersRef, where('userId', '==', user.uid));
};

export const getOrdersFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(await getVisibleOrdersQuery());
    return querySnapshot.docs.map(orderDoc => ({
      id: orderDoc.id,
      ...orderDoc.data()
    }));
  } catch (error) {
    throw withFirestoreRulesHint(error, 'loading orders');
  }
};

export const subscribeToOrders = (onData, onError, user = auth.currentUser) => {
  let unsubscribe = () => {};
  let cancelled = false;
  getVisibleOrdersQuery(user).then((ordersQuery) => {
    if (cancelled) return;
    unsubscribe = onSnapshot(ordersQuery, snapshot => onData(snapshot.docs.map(orderDoc => ({
      id: orderDoc.id,
      ...orderDoc.data()
    }))), (error) => onError(withFirestoreRulesHint(error, 'loading orders')));
  }).catch((error) => onError(withFirestoreRulesHint(error, 'loading orders')));
  return () => { cancelled = true; unsubscribe(); };
};

export const addOrderToFirestore = async (order) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Не выполнен вход через Firebase. Войдите в аккаунт и попробуйте снова.');
  }

  try {
    console.info('[Firestore] Создание заказа', {
      itemCount: Array.isArray(order.items) ? order.items.length : 0,
      total: order.total
    });

    const orderRef = doc(collection(db, "orders"));
    const paymentId = orderRef.id;
    const shipmentId = orderRef.id;
    const batch = writeBatch(db);
    const now = serverTimestamp();
    const items = Array.isArray(order.items) ? order.items : [];

    batch.set(orderRef, {
      ...order,
      userId: user.uid,
      paymentId,
      shipmentId,
      createdAt: now,
      updatedAt: now
    });
    items.forEach((item, index) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.price) || 0;
      batch.set(doc(db, "order_items", `${orderRef.id}_${index}`), {
        orderId: orderRef.id,
        userId: user.uid,
        productId: String(item.productId || item.id || ''),
        name: String(item.name || item.title || ''),
        quantity,
        unitPrice: price,
        subtotal: price * quantity,
        createdAt: now
      });
    });
    batch.set(doc(db, "payments", paymentId), {
      orderId: orderRef.id,
      userId: user.uid,
      amount: Number(order.total) || 0,
      currency: order.currency || 'KZT',
      method: ['card', 'cash', 'crypto'].includes(order.paymentMethod || order.payment) ? (order.paymentMethod || order.payment) : 'cash',
      status: 'pending',
      createdAt: now,
      updatedAt: now
    });
    batch.set(doc(db, "shipments", shipmentId), {
      orderId: orderRef.id,
      userId: user.uid,
      currentStatus: order.status || 'new',
      history: [{ status: order.status || 'new', createdAt: Date.now() }],
      createdAt: now,
      updatedAt: now
    });
    await batch.commit();

    console.info('[Firestore] Order created', { id: orderRef.id });
    return orderRef.id;
  } catch (error) {
    console.error('[Firestore] Не удалось создать заказ', {
      code: error.code,
      message: error.message
    });
    throw withFirestoreRulesHint(error, 'placing the order');
  }
};

export const updateOrderInFirestore = async (id, updates) => {
  const orderRef = doc(db, "orders", String(id));

  return runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists()) {
      throw new Error('Заказ не найден.');
    }

    const currentOrder = orderSnapshot.data();
    const updatedAt = new Date().toISOString();
    const nextOrder = { ...updates, updatedAt };

    if (updates.status && updates.status !== currentOrder.status) {
      nextOrder.statusHistory = [
        ...(Array.isArray(currentOrder.statusHistory) ? currentOrder.statusHistory : []),
        { status: updates.status, date: updatedAt }
      ];
    }

    transaction.update(orderRef, nextOrder);
    return { id: orderSnapshot.id, ...currentOrder, ...nextOrder };
  });
};

export const deleteOrderFromFirestore = async (id) => {
  await deleteDoc(doc(db, "orders", String(id)));
};

// Отзывы хранятся в Firestore и доступны всем посетителям для чтения.
