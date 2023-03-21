import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorDTO,
  TenantLogoUpdateDTO,
} from '../../../../components-shared/tenant-def';
import { ensureAuth } from '../../../../components-backend/middleware/apiAuthentication';
import { uploadToTenantStorage } from '../../../../components-backend/tenantService';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type TenantUpdateRequest = Override<
  NextApiRequest,
  { body: TenantLogoUpdateDTO }
>;

export const UpdateTenantLogoApi = async (
  req: TenantUpdateRequest,
  res: NextApiResponse<void | ErrorDTO>
) => {
  return ensureAuth(req, res, async () => {
    const tenantId = req.query.tid as string;
    const imageBuffer = Buffer.from(req.body.imageAsBase64, 'base64');

    await uploadToTenantStorage({
      tenantId: tenantId,
      file: imageBuffer,
    });

    return res.status(204).send();
  });
};

export default UpdateTenantLogoApi;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};
