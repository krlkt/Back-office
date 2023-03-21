import { FEATURE_VALUE } from './featureWrapper';

export interface TenantDTO {
  readonly id: string;
  readonly name: string;
  readonly companyLanguage: string;
  readonly features: FEATURE_VALUE[];
  readonly logoAsBase64?: string | null;
}

export interface FeatureDTO {
  readonly id: string;
  readonly tenants: TenantDTO[];
}

export interface TenantsDTO {
  readonly tenants: TenantDTO[];
}

export interface ErrorDTO {
  readonly message: string;
}

export interface TenantCreationDTO {
  readonly tenantName: string;
  readonly companyLanguage: string;
  readonly features: string[];
}

export interface TenantUpdateDTO extends Partial<Omit<TenantDTO, 'id'>> {
  readonly id: string;
}

export interface TenantTargetDTO {
  readonly tenantId: string;
}

export interface TenantLogoUpdateDTO {
  readonly imageAsBase64: string;
}
