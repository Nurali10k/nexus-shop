import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { defaultProducts } from "../store/defaultProducts";

export const seedDefaultProductsIfEmpty = async () => {
  if (auth.currentUser?.email !== 'admin@nexus.com') return false;

  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  if (!snapshot.empty) return false;

  const batch = writeBatch(db);
  defaultProducts.forEach(({ id, ...product }) => {
    batch.set(doc(productsRef, `default-${id}`), product);
  });
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
  const docRef = await addDoc(collection(db, "products"), product);
  return docRef.id;
};

export const updateProductInFirestore = async (id, product) => {
  await updateDoc(doc(db, "products", String(id)), product);
};

export const deleteProductFromFirestore = async (id) => {
  await deleteDoc(doc(db, "products", String(id)));
};

// ===== ЗАКАЗЫ =====
const getVisibleOrdersQuery = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Войдите через Firebase, чтобы просматривать заказы.');
  }

  const ordersRef = collection(db, "orders");
  return user.email === 'admin@nexus.com'
    ? ordersRef
    : query(ordersRef, where('userId', '==', user.uid));
};

export const getOrdersFromFirestore = async () => {
  const querySnapshot = await getDocs(getVisibleOrdersQuery());
  return querySnapshot.docs.map(orderDoc => ({
    id: orderDoc.id,
    ...orderDoc.data()
  }));
};

export const subscribeToOrders = (onData, onError) => {
  let ordersQuery;
  try {
    ordersQuery = getVisibleOrdersQuery();
  } catch (error) {
    onError(error);
    return () => {};
  }
  return onSnapshot(
    ordersQuery,
    snapshot => onData(snapshot.docs.map(orderDoc => ({
      id: orderDoc.id,
      ...orderDoc.data()
    }))),
    onError
  );
};

export const addOrderToFirestore = async (order) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Не выполнен вход через Firebase. Обновите страницу и попробуйте снова.');
  }

  const docRef = await addDoc(collection(db, "orders"), {
    ...order,
    userId: user.uid,
    createdAt: order.createdAt || new Date().toISOString()
  });
  return docRef.id;
};

export const updateOrderInFirestore = async (id, order) => {
  await updateDoc(doc(db, "orders", String(id)), order);
};

export const deleteOrderFromFirestore = async (id) => {
  await deleteDoc(doc(db, "orders", String(id)));
};