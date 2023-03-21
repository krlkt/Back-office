import { Admin, Consumer, Kafka, KafkaMessage, logLevel } from 'kafkajs';
import { faker } from '@faker-js/faker';
import { Hello } from '@caracat/event-lib/dist/schemas/dist/events/hello';
import { testLogger } from './testLogger';

const aKafkaClient = () => {
  return new Kafka({
    brokers: (process.env.APP_KAFKA_CONNECT_ADDRESS || '').split(','),
    logLevel: logLevel.ERROR,
    logCreator: () => {
      return ({ log }) => {
        testLogger.error('[kafka-js]', log);
      };
    },
  });
};

export const withKafkaAdmin = async <T>(
  processFn: (admin: Admin) => Promise<T>
) => {
  const kafkaClient = aKafkaClient();
  const admin = kafkaClient.admin();
  await admin.connect();
  try {
    return await processFn(admin);
  } finally {
    await admin.disconnect();
  }
};

export const withKafkaConsumer = async <T>(
  processFn: (consumer: Consumer) => Promise<T>,
  groupId?: string
) => {
  const consumer = aKafkaClient().consumer({
    groupId: groupId || `group_${faker.random.word()}_${faker.datatype.uuid()}`,
  });
  await consumer.connect();
  try {
    return await processFn(consumer);
  } finally {
    await consumer.disconnect();
  }
};

export const createTopic = (topicName: string) => {
  return withKafkaAdmin(async (kafkaAdmin) => {
    await kafkaAdmin.createTopics({
      topics: [{ topic: topicName, numPartitions: 4, replicationFactor: 1 }],
    });
  });
};

const toPartitionToOffsetDict = (
  input: { partition: number; offset: string }[]
): Record<number, string> => {
  return input.reduce(
    (partitionToOffset, { partition, offset }) => ({
      ...partitionToOffset,
      [partition]: offset,
    }),
    {}
  );
};

const offsetReached = (
  targetOffset: Record<number, string>,
  currentOffset: Record<number, string>
) => {
  return Object.entries(targetOffset)
    .filter((partitionToTargetOffset) => partitionToTargetOffset[1] !== '0') // filter all target seek offset of 0 (empty partition)
    .every(
      ([partition, targetPartitionOffset]) =>
        parseInt(currentOffset[partition as unknown as number]) >=
        parseInt(targetPartitionOffset) // current seek offset have to be equal or greater than target seek offset
    );
};

type ConsumedMessages = {
  consumedMessages: KafkaMessage[];
  consumedMessagesByPartition: Map<number, KafkaMessage[]>;
};

export const consumeUntil = async (
  topicName: string,
  untilFn: (consumedMessages: ConsumedMessages) => Promise<boolean>,
  groupId?: string,
  timeoutMs = 5000
): Promise<ConsumedMessages> => {
  return withKafkaConsumer(
    (consumer) =>
      new Promise(async (resolve, reject) => {
        const consumedMessages: KafkaMessage[] = [];
        const consumedMessagesByPartition: Map<number, KafkaMessage[]> =
          new Map();

        const crashIfNotFulfilledUntilTimeout = setTimeout(() => {
          reject(
            `failed to consume all messages in ${topicName} in ${timeoutMs}ms`
          );
        }, timeoutMs);

        await consumer.subscribe({
          topic: topicName,
          fromBeginning: true,
        });
        await consumer.run({
          autoCommit: false,
          eachMessage: async ({ partition, message }) => {
            consumedMessages.push(message);
            consumedMessagesByPartition.set(partition, [
              ...(consumedMessagesByPartition.get(partition) || []),
              message,
            ]);

            const currentResult: ConsumedMessages = {
              consumedMessages,
              consumedMessagesByPartition,
            };
            if (!(await untilFn(currentResult))) {
              testLogger.debug('consumed', {
                partition,
                messageKey: message.key?.toString(),
                messageValue: message.value?.toString(),
              });
              return;
            }
            testLogger.debug('consumed-last', {
              partition,
              messageKey: message.key?.toString(),
              messageValue: message.value?.toString(),
            });
            clearTimeout(crashIfNotFulfilledUntilTimeout);
            resolve(currentResult);
          },
        });
      }),
    groupId
  );
};

export const allMessages = async (
  topicName: string
): Promise<ConsumedMessages> => {
  let maxPartitionToOffset: Record<number, string>;
  const updateMaxOffset = async () => {
    maxPartitionToOffset = toPartitionToOffsetDict(
      await withKafkaAdmin((admin) => admin.fetchTopicOffsets(topicName))
    );
  };
  await updateMaxOffset();

  return consumeUntil(topicName, async (consumedMessage) => {
    const currentPartitionToOffset = toPartitionToOffsetDict(
      Array.from(consumedMessage.consumedMessagesByPartition.entries()).map(
        ([partition, messages]) => {
          const currentMessageOffset = messages.slice(-1)[0]?.offset || '-1'; // offset of current message
          const seekOffset = parseInt(currentMessageOffset) + 1; // the offset which will be seeked next
          return {
            partition,
            offset: String(seekOffset), // back as string as offset is string
          };
        }
      )
    );
    const offsetReachedOnce = offsetReached(
      maxPartitionToOffset,
      currentPartitionToOffset
    );
    if (!offsetReachedOnce) {
      return false;
    }

    // offset needs to be refreshed to ensure that we consume latest messages
    await updateMaxOffset();
    return offsetReached(maxPartitionToOffset, currentPartitionToOffset);
  });
};

export const aTestEvent = (event: Partial<Hello> = {}): Hello => {
  return {
    eventType: 'hello/worlded',
    userType: 'tenantUser',
    eventId: event.eventId || faker.datatype.uuid(),
    userId: event.userId || `user_${faker.datatype.uuid()}`,
    tenantId: event.tenantId || `tenant_${faker.datatype.uuid()}`,
    timestamp: event.timestamp || faker.date.soon().toISOString(),
    payload: {
      hello: event.payload?.hello || faker.lorem.sentence(),
    },
  };
};
