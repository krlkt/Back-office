import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Global } from '../globalsetup';
import { LogWaitStrategy } from 'testcontainers/dist/wait-strategy';
import { testLogger } from '../testLogger';

declare let global: Global;

export interface MockServerProps {
  endpointUrl: string;
  container: StartedTestContainer;
}

export async function startMockServerContainer() {
  const startMs = new Date().getTime();
  testLogger.info('starting mock server container');
  const container = await new GenericContainer('mockserver/mockserver')
    .withExposedPorts(1080)
    .withWaitStrategy(new LogWaitStrategy('started on port: 1080'))
    .start();

  const mockServerUrl = `${container.getHost()}:${container.getMappedPort(
    1080
  )}`;
  testLogger.info(
    `started mock server at ${mockServerUrl} in ${
      new Date().getTime() - startMs
    }ms`
  );
  return { container, mockServerUrl };
}

export async function prepareMockServer(): Promise<void> {
  const { container, mockServerUrl } = await startMockServerContainer();

  global.MOCKSERVER = {
    container,
    endpointUrl: mockServerUrl,
  };
}

export async function shutdownMockServer(): Promise<void> {
  await global.MOCKSERVER?.container.stop();
}
