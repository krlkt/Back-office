import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorDTO,
  TenantTargetDTO,
} from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import { deleteTenant } from '../../../components-backend/tenantService';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type TenantDeletionRequest = Override<
  NextApiRequest,
  { body: TenantTargetDTO }
>;

export const DeleteTenantApi = async (
  req: TenantDeletionRequest,
  res: NextApiResponse<{ tenantId: string } | ErrorDTO>
) => {
  return ensureAuth(req, res, async (authenticatedUser) => {
    if (!req.body.tenantId) {
      return res.status(400).json({
        message: 'Empty tenant id',
      });
    }

    await deleteTenant(req.body.tenantId, authenticatedUser.userId);

    return res.status(200).json({
      message: 'Successfully deleted tenant',
    });
  });
};

export default DeleteTenantApi;
