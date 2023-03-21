import { mockServerClient } from 'mockserver-client';
import { Global } from '../globalsetup';
import { MockServerClient } from 'mockserver-client/mockServerClient';
import { UsersDTO } from '../../../components-shared/user-def';

declare let global: Global;

let _mockClient: MockServerClient;

export const getMockClient = () => {
  if (!_mockClient) {
    _mockClient = mockServerClient(
      global.MOCKSERVER.endpointUrl.split(':')[0],
      parseInt(global.MOCKSERVER.endpointUrl.split(':')[1])
    );
  }
  return _mockClient;
};

export const resetMockServer = async () => {
  await getMockClient().reset();
};

export const mockUserService = async () => {
  await getMockClient().mockAnyResponse({
    httpRequest: {
      path: '/api/admin/tenants/.*/employees',
      method: 'POST',
    },
    httpResponse: {
      statusCode: 204,
    },
    times: {
      unlimited: true,
    },
  });
  const usersResponseMock: UsersDTO = {
    users: [
      {
        id: '1',
        email: 'karelkarunia@caralegal.eu',
        firstName: 'Karel',
        lastName: 'Karunia',
        userRole: 'admin',
        orgUnitId: 'abcabc',
        featureIds: ['owlit-user', 'websites-user'],
      },
      {
        id: '2',
        email: 'johndoe@caralegal.eu',
        firstName: 'John',
        lastName: 'Doe',
        userRole: 'basicplus',
        orgUnitId: 'johndoe-dev',
        featureIds: ['owlit-user', 'websites-user'],
      },
      {
        id: '3',
        email: 'thomasedison@caralegal.eu',
        firstName: 'Thomas',
        lastName: 'Edison',
        userRole: 'expert',
        orgUnitId: 'thomasalvaedison',
        featureIds: ['owlit-user', 'websites-user'],
      },
      {
        id: '4',
        email: 'charlie@caralegal.eu',
        firstName: 'Charlie',
        lastName: 'Watson',
        userRole: 'expert',
        orgUnitId: 'charliewatson-dev',
        featureIds: ['owlit-user', 'websites-user'],
      },
    ],
  };
  await getMockClient().mockAnyResponse({
    httpRequest: {
      path: '/api/admin/tenants/.*/users',
      method: 'GET',
    },
    httpResponse: {
      statusCode: 200,
      body: {
        json: usersResponseMock,
      },
    },
    times: {
      unlimited: true,
    },
  });
};
