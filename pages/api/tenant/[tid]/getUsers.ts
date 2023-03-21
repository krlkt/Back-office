import { getAllUsersInTenant } from '../../../../components-backend/tenantService';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO } from '../../../../components-shared/tenant-def';
import { ensureAuth } from '../../../../components-backend/middleware/apiAuthentication';
import { UsersDTO } from '../../../../components-shared/user-def';

export const getUsersApi = async (
  req: NextApiRequest,
  res: NextApiResponse<UsersDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async () => {
    const tenantId = req.query.tid as string;
    const users = await getAllUsersInTenant({
      tenantId,
    });

    return res.status(200).send(users);
  });
};

export default getUsersApi;
