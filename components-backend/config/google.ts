import { OAuth2Client } from 'google-auth-library';
import { getBackendAxios } from './axios';
import { getGoogleGroupId, googleClientId } from './env';

export interface Role {
  readonly name: string;
}

export interface Member {
  readonly name: string;
  readonly preferredMemberKey: { id: string };
  readonly roles: Array<Role>;
}

let _client: OAuth2Client;
const googleClient = () => {
  if (!_client) {
    _client = new OAuth2Client(googleClientId());
  }
  return _client;
};

export const verifyIdToken = (token: string) => {
  return googleClient().verifyIdToken({
    idToken: token,
    audience: googleClientId(),
  });
};

export interface GroupCache {
  readonly time: Date;
  readonly members: string[];
}

let cache: GroupCache = { time: new Date(0), members: [] };
const cacheDuration = 15 * 60 * 1000; // 15 minutes

const fetchWithCache = async (accessToken?: string): Promise<GroupCache> => {
  const now = new Date().getTime();
  if (!cache || cache.time.getTime() + cacheDuration < now) {
    try {
      const result = await getBackendAxios().get(
        `https://cloudidentity.googleapis.com/v1/groups/${getGoogleGroupId()}/memberships`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      cache = {
        members: result.data?.memberships
          ?.map((member: Member) => {
            return member?.preferredMemberKey?.id;
          })
          .filter((a: string) => a),
        time: new Date(),
      };
    } catch (error) {
      console.warn(
        'Failed to fetch membership group data, will retry next time'
      );
      return cache;
    }
  }
  return cache;
};

export const verifyGroupEligibility = async (
  email: string,
  accessToken: string
) => {
  const cache = await fetchWithCache(accessToken);

  if (!cache || !cache.members.includes(email)) {
    return false;
  }

  return true;
};
