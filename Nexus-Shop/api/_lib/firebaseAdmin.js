import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const env = globalThis.process?.env ?? {};
  let serviceAccount;
  try {
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service account JSON.');
  }

  const normalizedAccount = serviceAccount && {
    projectId: serviceAccount.projectId || serviceAccount.project_id,
    clientEmail: serviceAccount.clientEmail || serviceAccount.client_email,
    privateKey: serviceAccount.privateKey || serviceAccount.private_key,
  };
  if (!normalizedAccount?.projectId || !normalizedAccount?.clientEmail || !normalizedAccount?.privateKey) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  return initializeApp({ credential: cert(normalizedAccount) });
}

export function getAdminServices() {
  const app = getAdminApp();
  return { auth: getAuth(app), db: getFirestore(app) };
}

export async function verifyBearerToken(request, auth) {
  const authorization = request.headers?.authorization || request.headers?.Authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    return await auth.verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

export async function requireActiveUser(request, auth, db) {
  const token = await verifyBearerToken(request, auth);
  if (!token?.uid) return null;
  if (db) {
    const profile = await db.collection('users').doc(token.uid).get();
    if (profile.exists && profile.data()?.isActive === false) return null;
  }
  return token;
}

export async function requireAdmin(request, auth, db) {
  const token = await requireActiveUser(request, auth, db);
  if (!token) return null;
  if (token.email?.toLowerCase() === 'admin@nexus.com') return token;
  const profile = await db.collection('users').doc(token.uid).get();
  return profile.data()?.role === 'admin' && profile.data()?.isActive !== false ? token : null;
}

