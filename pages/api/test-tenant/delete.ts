import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO } from '../../../components-shared/tenant-def';
import { getProjectId } from '../../../components-backend/config/env';
import { deleteTenant } from '../../../components-backend/tenantService';

export const TenantsApi = async (
  req: NextApiRequest,
  res: NextApiResponse<{ tenantId: string } | ErrorDTO>
) => {
  const whitelistedProjectIDs = ['gdpr-mgmt-dev', 'gdpr-mgmt-stage'];

  if (!whitelistedProjectIDs.includes(getProjectId())) {
    return res.status(403).json({
      message: 'this api can only be used on dev and stage',
    });
  }

  const { tenantId } = req.body;

  if (!tenantId.startsWith('AutomatedTest-')) {
    return res.status(403).json({
      message: 'Tenant id must start with "AutomatedTest-"',
    });
  }

  await deleteTenant(tenantId, 'system');

  return res.status(200).json({
    tenantId: tenantId,
  });
};

export default TenantsApi;
