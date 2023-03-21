import admin, { AppOptions } from 'firebase-admin';
import { getFirebaseCreds } from './env';

let initialized = false;

const initializeIfNeeded = () => {
  if (initialized) {
    return;
  }

  const creds = getFirebaseCreds();
  const appOptions: AppOptions = creds.private_key
    ? {
        credential: admin.credential.cert(creds),
        storageBucket: `${creds.project_id}.appspot.com`,
      }
    : {
        projectId: creds.projectId,
        storageBucket: `${creds.projectId}.appspot.com`,
      };
  try {
    admin.initializeApp(appOptions);
    initialized = true;
  } catch (error) {}
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  initializeIfNeeded();
  return admin.auth();
};

export const getFirestore = (): admin.firestore.Firestore => {
  initializeIfNeeded();
  return admin.firestore();
};

export const getStorage = (): admin.storage.Storage => {
  initializeIfNeeded();
  return admin.storage();
};
