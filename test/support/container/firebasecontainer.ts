import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Global } from '../globalsetup';
import { faker } from '@faker-js/faker';
import { testLogger } from '../testLogger';

declare let global: Global;

export interface FirebaseProps {
  projectId: string;
  firestoreUrl: string;
  firebaseAuthUrl: string;
  firebaseStorageUrl: string;
  firebaseUIUrl: string;
  container: StartedTestContainer;
}

const FIRESTORE_PORT = 8080;
const FIREBASE_AUTH_PORT = 9099;
const FIREBASE_STORAGE_PORT = 9199;
const EMULATOR_UI_PORT = 4000;

async function startFirebaseContainer() {
  const startMs = new Date().getTime();
  testLogger.info('starting firebase docker container');
  const projectId = `project-${faker.animal.type()}`;
  const container = await new GenericContainer('spine3/firebase-emulator')
    .withStartupTimeout(120000)
    .withExposedPorts(
      {
        container: FIRESTORE_PORT,
        host: FIRESTORE_PORT,
      },
      {
        container: FIREBASE_AUTH_PORT,
        host: FIREBASE_AUTH_PORT,
      },
      {
        container: FIREBASE_STORAGE_PORT,
        host: FIREBASE_STORAGE_PORT,
      },
      {
        container: EMULATOR_UI_PORT,
        host: EMULATOR_UI_PORT,
      }
    )
    .withEnv('GCP_PROJECT', projectId)
    .withEnv('ENABLE_UI', 'true')
    .start();

  const firestoreUrl = `${container.getHost()}:${container.getMappedPort(
    FIRESTORE_PORT
  )}`;
  testLogger.info(
    `started firestore emulator at ${firestoreUrl} in ${
      new Date().getTime() - startMs
    }ms`
  );
  const firebaseAuthUrl = `${container.getHost()}:${container.getMappedPort(
    FIREBASE_AUTH_PORT
  )}`;
  testLogger.info(
    `started firebase auth emulator at ${firebaseAuthUrl} in ${
      new Date().getTime() - startMs
    }ms`
  );
  const firebaseStorageUrl = `${container.getHost()}:${container.getMappedPort(
    FIREBASE_STORAGE_PORT
  )}`;
  testLogger.info(
    `started firebase storage emulator at ${firebaseAuthUrl} in ${
      new Date().getTime() - startMs
    }ms`
  );
  const firebaseUIUrl = `${container.getHost()}:${container.getMappedPort(
    EMULATOR_UI_PORT
  )}`;
  testLogger.info(
    `started firebase emulator UI at http://${firebaseUIUrl} in ${
      new Date().getTime() - startMs
    }ms`
  );
  return {
    container,
    firestoreUrl,
    firebaseAuthUrl,
    firebaseStorageUrl,
    firebaseUIUrl,
    projectId,
  };
}

export async function prepareFirebase(): Promise<void> {
  if (process.env.LOCALRUN_DEV_FIREBASE) {
    testLogger.info(
      'skipping firebase emulator as LOCALRUN_DEV_FIREBASE env variable is set'
    );
    return;
  }

  const {
    container,
    firestoreUrl,
    firebaseAuthUrl,
    firebaseStorageUrl,
    firebaseUIUrl,
    projectId,
  } = await startFirebaseContainer();

  process.env.FIRESTORE_EMULATOR_HOST = firestoreUrl;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = firebaseAuthUrl;
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = firebaseStorageUrl;
  process.env.FIREBASE_LOCAL = 'true';
  process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ projectId });

  global.FIREBASE = {
    container,
    firestoreUrl,
    firebaseAuthUrl,
    firebaseStorageUrl,
    firebaseUIUrl,
    projectId,
  };
}

export async function shutdownFirebase(): Promise<void> {
  await global.FIREBASE?.container.stop();
}
