import { loadEnv } from 'vite';
import { getAdminServices } from '../api/_lib/firebaseAdmin.js';

const env = loadEnv('development', process.cwd(), '');
for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']) {
  if (env[key]) process.env[key] = env[key];
}

const COLLECTIONS_TO_ENSURE = [
  'users',
  'reviews',
  'categories',
  'brands',
  'wishlist',
  'notifications',
  'settings',
  'audit_logs',
];

const { db } = getAdminServices();
const result = { created: [], alreadyPresent: [] };

for (const collectionName of COLLECTIONS_TO_ENSURE) {
  const collectionRef = db.collection(collectionName);
  const existing = await collectionRef.limit(1).get();
  if (!existing.empty) {
    result.alreadyPresent.push(collectionName);
    continue;
  }

  try {
    await collectionRef.doc('_system_placeholder').create({ placeholder: true });
    result.created.push(collectionName);
  } catch (error) {
    if (error.code === 6 || error.code === 'already-exists') {
      result.alreadyPresent.push(collectionName);
      continue;
    }
    throw error;
  }
}

console.info('[Firestore] Core collections checked:', result);
