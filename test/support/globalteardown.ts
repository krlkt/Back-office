import { shutdownKafka } from './container/kafkacontainer';
import { shutdownFirebase } from './container/firebasecontainer';

const globalTeardown = async (): Promise<void> => {
  await Promise.all([shutdownKafka(), shutdownFirebase()]);
};

export default globalTeardown;
