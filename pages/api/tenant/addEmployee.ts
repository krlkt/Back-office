import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorDTO,
  TenantTargetDTO,
} from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import { addEmployeeAsTenantAdmin } from '../../../components-backend/tenantService';
import { EmployeeLoginTokenDTO } from '../../../components-shared/employee-login-def';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type TenantTargetPayload = Override<
  NextApiRequest,
  { body: TenantTargetDTO }
>;

export const AddEmployeeApi = async (
  req: TenantTargetPayload,
  res: NextApiResponse<EmployeeLoginTokenDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async (authenticatedUser) => {
    const { tenantId } = req.body;
    const employeeLoginToken = await addEmployeeAsTenantAdmin({
      tenantId,
      employeeEmail: authenticatedUser.email,
    });

    return res.status(200).send(employeeLoginToken);
  });
};

export default AddEmployeeApi;
