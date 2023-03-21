import { KafkaContainer, StartedKafkaContainer } from 'testcontainers';
import { Global } from '../globalsetup';
import { createTopic } from '../kafkaHelper';
import { testLogger } from '../testLogger';

declare let global: Global;

export interface KafkaProps {
  container: StartedKafkaContainer;
  connectAddress: string;
}

// 5.1 maps to kafka 2.1 https://docs.confluent.io/platform/current/installation/versions-interoperability.html
const KAFKA_2_1_IMAGE_NAME = 'confluentinc/cp-kafka:5.1.4-10';

async function startKafkaContainer() {
  const startMs = new Date().getTime();
  testLogger.info('starting kafka docker container');

  const container = await new KafkaContainer(KAFKA_2_1_IMAGE_NAME)
    .withExposedPorts(9093)
    .start();

  const connectAddress = `${container.getHost()}:${container.getMappedPort(
    9093
  )}`;
  testLogger.info(
    `started kafka at ${connectAddress} in ${new Date().getTime() - startMs}ms`
  );

  return {
    container,
    connectAddress,
  };
}

export async function prepareKafka(): Promise<KafkaProps> {
  const { container, connectAddress } = await startKafkaContainer();

  process.env.APP_KAFKA_CONNECT_ADDRESS = connectAddress;

  await createTopic('user-event');

  global.KAFKA = {
    container,
    connectAddress,
  };
  return global.KAFKA;
}

export async function shutdownKafka(): Promise<void> {
  await global.KAFKA?.container.stop();
}
