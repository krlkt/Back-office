import { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '../config/google';
import { ErrorDTO } from '../../components-shared/tenant-def';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';

export interface AuthenticatedUser {
  readonly idToken: string;
  readonly userId: string;
  readonly email: string;
}

export const ensureAuth = async <Response>(
  req: NextApiRequest,
  res: NextApiResponse<Response | ErrorDTO>,
  endpoint: (authenticatedUser: AuthenticatedUser) => Promise<void>
) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .send({ message: 'Authorization header is missing.' });
  }

  const token = req.headers.authorization
    .replaceAll('Bearer ', '')
    .split(':::');

  if (token.length !== 2) {
    return res
      .status(401)
      .send({ message: 'Needs both id token and access token.' });
  }
  const [idToken] = token;

  let verifiedIDToken: LoginTicket;
  try {
    verifiedIDToken = await verifyIdToken(idToken);
  } catch (e) {
    return res
      .status(401)
      .send({ message: 'Authorization header is invalid.' });
  }

  const email = verifiedIDToken.getPayload()?.email;
  if (!email) {
    return res.status(403).send({ message: 'No email' });
  }

  // const isValidEmail = email?.endsWith('caralegal.eu');
  // if (!isValidEmail) {
  //   return res.status(403).send({ message: 'Not a caralegal employee' });
  // }

  if (!verifiedIDToken.getPayload()?.email_verified) {
    return res.status(403).send({ message: 'Email is not verified' });
  }

  const userId = verifiedIDToken.getUserId();
  if (!userId) {
    return res.status(403).send({ message: 'No valid user id' });
  }

  // const hasGroupAccess = await verifyGroupEligibility(email, accessToken);

  // if (!hasGroupAccess) {
  //   return res.status(403).send({
  //     message: `${email} is not eligible to use caralegal back office. Please contact dev team.`,
  //   });
  // }
  return endpoint({ idToken, userId, email });
};
