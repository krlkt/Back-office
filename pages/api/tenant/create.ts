import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorDTO,
  TenantCreationDTO,
} from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import { createTenantWithoutUser } from '../../../components-backend/tenantService';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type TenantCreationRequest = Override<
  NextApiRequest,
  { body: TenantCreationDTO }
>;

export const CreateTenantApi = async (
  req: TenantCreationRequest,
  res: NextApiResponse<{ tenantId: string } | ErrorDTO>
) => {
  return ensureAuth(req, res, async (authenticatedUser) => {
    if (
      !req.body.tenantName ||
      !req.body.companyLanguage ||
      !req.body.features
    ) {
      return res.status(400).json({
        message:
          'Failed to create tenant. tenantName and companyLanguage must exists',
      });
    }

    const { tenantId } = await createTenantWithoutUser({
      tenantName: req.body.tenantName,
      companyLanguage: req.body.companyLanguage,
      employeeUID: authenticatedUser.userId,
      features: req.body.features,
    });
    return res.status(200).json({
      tenantId: tenantId,
    });
  });
};

export default CreateTenantApi;
