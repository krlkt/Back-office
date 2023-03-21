import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO } from '../../../components-shared/tenant-def';
import {
  addTestEmployees,
  createTenantWithoutUser,
} from '../../../components-backend/tenantService';
import { getProjectId } from '../../../components-backend/config/env';

export const TenantsApi = async (
  req: NextApiRequest,
  res: NextApiResponse<{ tenantId: string; userIds: string[] } | ErrorDTO>
) => {
  const whitelistedProjectIDs = ['gdpr-mgmt-dev', 'gdpr-mgmt-stage'];

  if (!whitelistedProjectIDs.includes(getProjectId())) {
    return res.status(403).json({
      message: 'this api can only be used on dev and stage',
    });
  }

  const { tenantName, companyLanguage, features } = req.body;

  if (!tenantName.startsWith('AutomatedTest-')) {
    return res.status(403).json({
      message: 'Tenant name must start with "AutomatedTest-"',
    });
  }

  const { tenantId } = await createTenantWithoutUser({
    tenantName: tenantName,
    companyLanguage: companyLanguage,
    employeeUID: 'system',
    features: features,
  });

  // user service add 4 users
  const tenantAndUserIds = await addTestEmployees({
    tenantId,
  });

  return res.status(200).json({
    tenantId: tenantAndUserIds.tenantId,
    userIds: tenantAndUserIds.userIds,
  });
};

export default TenantsApi;
