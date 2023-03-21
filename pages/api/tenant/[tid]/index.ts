import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO, TenantDTO } from '../../../../components-shared/tenant-def';
import { ensureAuth } from '../../../../components-backend/middleware/apiAuthentication';
import { getTenant } from '../../../../components-backend/tenantService';

export const TenantApi = async (
  req: NextApiRequest,
  res: NextApiResponse<TenantDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async () => {
    const tenantId = req.query.tid as string;
    if (!tenantId) {
      return res.status(400).json({
        message: 'tenant id needs to be present',
      });
    }

    const tenantData = await getTenant(tenantId);
    if (!tenantData) {
      return res.status(404).json({ message: `${tenantId} does not exist` });
    }

    return res.status(200).json(tenantData);
  });
};

export default TenantApi;
