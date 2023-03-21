import { FeatureDTO } from './../../../components-shared/tenant-def';
import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorDTO } from '../../../components-shared/tenant-def';
import { ensureAuth } from '../../../components-backend/middleware/apiAuthentication';
import { getFeature } from '../../../components-backend/featureService';

export const FeatureApi = async (
  req: NextApiRequest,
  res: NextApiResponse<FeatureDTO | ErrorDTO>
) => {
  return ensureAuth(req, res, async () => {
    const featureId = req.query.id as string;

    if (!featureId) {
      return res.status(400).json({
        message: 'feature id needs to be present',
      });
    }

    const featureData = await getFeature(featureId);
    if (!featureData) {
      return res.status(404).json({ message: `${featureId} does not exist` });
    }

    return res.status(200).json(featureData);
  });
};

export default FeatureApi;
