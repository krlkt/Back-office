import { createEventPublisher, EventPublisher } from '@caracat/event-lib';
import { randomUUID } from 'crypto';
import { kafkaConnectAddress } from './env';

let eventPublisher: EventPublisher;

export const getUserEventPublisher = async (): Promise<EventPublisher> => {
  if (!eventPublisher) {
    const publisherConfig = {
      clientId: randomUUID(),
      brokers: kafkaConnectAddress(),
      topic: 'user-event',
    };
    eventPublisher = await createEventPublisher(publisherConfig);
  }
  return eventPublisher;
};
