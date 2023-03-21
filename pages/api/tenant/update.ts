import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorDTO,
  TenantDTO,
  TenantUpdateDTO,
} from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import {
  getTenant,
  updateTenant,
} from '../../../components-backend/tenantService';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type TenantUpdateRequest = Override<
  NextApiRequest,
  { body: TenantUpdateDTO }
>;

export const UpdateTenantApi = async (
  req: TenantUpdateRequest,
  res: NextApiResponse<TenantDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async (authenticatedUser) => {
    const { id: tenantId, ...tenantUpdate } = req.body;
    await updateTenant(
      tenantId,
      {
        name: tenantUpdate.name,
        companyLanguage: tenantUpdate.companyLanguage,
        features: tenantUpdate.features,
      },
      authenticatedUser.userId
    );
    const tenantData = await getTenant(tenantId);
    if (!tenantData) {
      throw new Error(`Updated a tenant, but can't find again: ${tenantId}`);
    }

    return res.status(200).json(tenantData);
  });
};

export default UpdateTenantApi;
