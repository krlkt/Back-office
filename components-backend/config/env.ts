export function assertGetEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required ENV variable '${key}' is empty`);
  } else {
    return value;
  }
}

export function getFirebaseCreds() {
  const firebaseConfig = assertGetEnv('FIREBASE_SERVICE_ACCOUNT');
  return JSON.parse(firebaseConfig);
}

export const googleClientId = () =>
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const googleClientSecret = () =>
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '';

export function getFirebaseDomainUrl() {
  return (
    process.env.FIREBASE_CF_ENDPOINT ||
    `https://europe-west3-${getProjectId()}.cloudfunctions.net`
  );
}

export const createTenantCFEndpoint = () =>
  `${getFirebaseDomainUrl()}/createTenantAndTenantAdmin`;

export const deleteTenantCFEndpoint = () =>
  `${getFirebaseDomainUrl()}/deleteTenantAndTenantUsers`;

export function getProjectId() {
  return getFirebaseCreds().project_id || 'gdpr-mgmt-dev';
}

export function getHostnameEndpoint() {
  return process.env.NEXT_PUBLIC_HOSTNAME_ENDPOINT || 'http://localhost:3000';
}

export function getGoogleGroupId() {
  return process.env.BACK_OFFICE_GROUP_ID || '030j0zll1jteers';
}

export const getLocalKubernetesEndpoint = (serviceName: string) => {
  return `http://${serviceName}.default.svc.cluster.local`;
};

export const userEndpoint = () =>
  process.env.USER_ENDPOINT || getLocalKubernetesEndpoint('user-service');

export const userAPIKey = () => assertGetEnv('USER_API_KEY');

export const kafkaConnectAddress = (): string[] =>
  assertGetEnv('APP_KAFKA_CONNECT_ADDRESS')
    .split(',')
    .map((address) =>
      // add default port 9092 if without port
      address.split(':').length === 1 ? `${address}:9092` : address
    );
