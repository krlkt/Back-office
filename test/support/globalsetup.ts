import { KafkaProps, prepareKafka } from './container/kafkacontainer';
import { FirebaseProps, prepareFirebase } from './container/firebasecontainer';
import {
  MockServerProps,
  prepareMockServer,
} from './container/mockservercontainer';

export interface Global {
  KAFKA: KafkaProps;
  FIREBASE: FirebaseProps;
  MOCKSERVER: MockServerProps;
}

declare let global: Global;

const globalSetup = async (): Promise<void> => {
  await Promise.all([prepareKafka(), prepareFirebase(), prepareMockServer()]);

  process.env.USER_ENDPOINT =
    process.env.USER_ENDPOINT || `http://${global.MOCKSERVER.endpointUrl}`;
};

export default globalSetup;
