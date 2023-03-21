import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO, TenantsDTO } from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import { getTenants } from '../../../components-backend/tenantService';

export const TenantsApi = async (
  req: NextApiRequest,
  res: NextApiResponse<TenantsDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async () => {
    const tenants = await getTenants();

    return res.status(200).json({
      tenants: tenants,
    });
  });
};

export default TenantsApi;
