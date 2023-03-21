import type { NextApiRequest, NextApiResponse } from 'next';

export const HealthApi = (
  req: NextApiRequest,
  res: NextApiResponse<{ ping: string }>
) => {
  res.status(200).json({ ping: 'pong' });
};

export default HealthApi;
