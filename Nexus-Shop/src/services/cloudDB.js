// ============================================
// ОБЛАЧНАЯ БАЗА ДАННЫХ ЧЕРЕЗ JSONBin.io
// ============================================

// ⚠️ ЗАМЕНИ ЭТИ ДВА ЗНАЧЕНИЯ НА СВОИ!
const BIN_ID = 'ВСТАВЬ_СЮДА_BIN_ID';
const API_KEY = '$2a$10$ВСТАВЬ_СЮДА_MASTER_KEY';

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY
};

// Получить все данные из облака
export async function getCloudData() {
  try {
    const res = await fetch(`${BASE_URL}/latest`, { headers });
    const data = await res.json();
    return data.record;
  } catch (error) {
    console.error('Cloud DB error:', error);
    return null;
  }
}

// Обновить все данные в облаке
export async function updateCloudData(newData) {
  try {
    await fetch(BASE_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(newData)
    });
    return true;
  } catch (error) {
    console.error('Cloud DB update error:', error);
    return false;
  }
}

// === ПОЛЬЗОВАТЕЛИ ===
export const getCloudUsers = async () => {
  const data = await getCloudData();
  return data?.users || [];
};

export const addCloudUser = async (user) => {
  const data = await getCloudData();
  if (!data.users) data.users = [];
  data.users.push(user);
  return await updateCloudData(data);
};

// === ЗАКАЗЫ ===
export const getCloudOrders = async () => {
  const data = await getCloudData();
  return data?.orders || [];
};

export const addCloudOrder = async (order) => {
  const data = await getCloudData();
  if (!data.orders) data.orders = [];
  data.orders.push(order);
  return await updateCloudData(data);
};

export const updateCloudOrderStatus = async (orderId, status) => {
  const data = await getCloudData();
  const order = data.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, date: new Date().toISOString() });
    return await updateCloudData(data);
  }
  return false;
};

// === ТОВАРЫ ===
export const getCloudProducts = async () => {
  const data = await getCloudData();
  return data?.products || [];
};

export const addCloudProduct = async (product) => {
  const data = await getCloudData();
  if (!data.products) data.products = [];
  data.products.push(product);
  return await updateCloudData(data);
};

export const updateCloudProduct = async (product) => {
  const data = await getCloudData();
  const idx = data.products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    data.products[idx] = product;
    return await updateCloudData(data);
  }
  return false;
};

export const deleteCloudProduct = async (productId) => {
  const data = await getCloudData();
  data.products = data.products.filter(p => p.id !== productId);
  return await updateCloudData(data);
};