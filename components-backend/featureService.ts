import { getAllFeatures } from './../components-shared/featureWrapper';
import { FeatureDTO } from '../components-shared/tenant-def';
import { getTenants } from './tenantService';

const allFeatures = getAllFeatures();

export const getFeatures = async (): Promise<FeatureDTO[]> => {
  const tenants = await getTenants();

  return allFeatures.map((feature) => ({
    id: feature,
    tenants: tenants.filter((tenant) => tenant.features.includes(feature)),
  }));
};

export const getFeature = async (
  featureId: string
): Promise<FeatureDTO | null> => {
  const features = await getFeatures();

  return features.find((feature) => feature.id === featureId) || null;
};
