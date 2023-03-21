import { FEATURES } from './features';

export type FEATURE_VALUE = typeof FEATURES[keyof typeof FEATURES];
const featureTranslation: Record<FEATURE_VALUE, string> = {
  dataFlowUpload: 'Data flow upload (processing activities)',
  paTemplates: 'Processing activities',
  edtTemplates: 'External recipients (service providers)',
  erExport: 'External recipients - Excel export',
  tomTemplates: 'Technical and organizational measures (TOM)',
  dataSubjectPotentialAmount: 'Potential amount of data subjects (page 2)',
  DPALegalReview: 'Automated data processing agreement (DPA) check',
  dataClassification: 'Data classification (processing activities & resources)',
  deepLApi: 'DeepL translation',
  dataBreaches: 'Data breaches',
  dsrBasicSubmission: 'Allow basic users to create data subject requests',
  dsrExport: 'Data subject requests - Excel export',
  experimental: 'Experimental',
  risks: 'Risk management (overview feature)',
  languageFR: 'App language - French',
  languageCZ: 'App language - Czech',
  languagePL: 'App language - Polish',
  contactInfoProfiles:
    'Processing activities - Contact information profiles for export',
  taskSeenByUser: 'Task seen by user feature',
  risksOnProcessSubmission: 'Risk management (processing activities)',
  owlit: 'Owlit (online library)',
  userFeatures: 'Allow to set features per user (e.g. cookiebox, Owlit)',
  paExcelExport: 'Processing activities - Excel export',
  linkLegalRetentionPeriodsToOrgUnits:
    'Link legal retention periods to organizational units',
  deletionConcept: 'Deletion Concept',
  assets: 'Asset management',
  websites: 'Cookiebox (website check)',
  recurringTasks: 'Recurring tasks',
  resourceCustomContractType:
    'Custom contract types (external data transfer feature, compliance tab)',
  resourceCustomRequestType: 'Custom request types (requests feature)',
  dataBreachesDataSubjectInformed:
    'Data breaches - data subject rights section',
  fileUploadOnProcessingActivities: 'File upload (processing activities)',
  externalRecipientsInsightData: 'External Recipients - Insight Data',
  deletionTrigger: 'Custom deletion triggers',
};

export const translateFeatureId = (input: FEATURE_VALUE): string => {
  return featureTranslation[input] || input;
};

export interface FeatureCategoryType {
  readonly templates: FEATURE_VALUE[];
  readonly export: FEATURE_VALUE[];
  readonly resources: FEATURE_VALUE[];
  readonly languages: FEATURE_VALUE[];
  readonly others: FEATURE_VALUE[];
  readonly third_party: FEATURE_VALUE[];
  readonly features: FEATURE_VALUE[];
}

const featureCategory: Omit<FeatureCategoryType, 'features'> = {
  templates: [
    FEATURES.PA_TEMPLATES,
    FEATURES.TOM_TEMPLATES,
    FEATURES.EDT_TEMPLATES,
  ],
  export: [
    FEATURES.DSR_EXPORT,
    FEATURES.ER_EXPORT,
    FEATURES.PA_EXCEL_EXPORT,
    FEATURES.CONTACT_INFO_PROFILES,
  ],
  resources: [
    FEATURES.RESOURCES_CUSTOM_CONTRACT_TYPE,
    FEATURES.RESOURCES_CUSTOM_REQUEST_TYPE,
    FEATURES.RESOURCES_DELETION_TRIGGER,
    FEATURES.LINK_LEGAL_RETENTION_PERIODS_TO_ORG_UNITS,
    FEATURES.DATA_CLASSIFICATION,
  ],
  languages: [FEATURES.LANGUAGE_FR, FEATURES.LANGUAGE_CZ, FEATURES.DEEP_L, FEATURES.LANGUAGE_PL],
  others: [FEATURES.EXPERIMENTAL, FEATURES.USER_FEATURES],
  third_party: [FEATURES.WEBSITES, FEATURES.OWLIT],
};

export const getFeaturesPerCategory = (): FeatureCategoryType => {
  const allFeatureInCategories: string[] =
    Object.values(featureCategory).flat();

  const featuresWithoutCategory = Object.values(FEATURES).filter(
    (featureId) => !allFeatureInCategories.includes(featureId)
  );

  return {
    ...featureCategory,
    features: featuresWithoutCategory,
  } as const;
};

export const getAllFeatures = (): FEATURE_VALUE[] => {
  return Object.values(FEATURES);
};

export const allFeaturesInCategoryIsOn = (
  featuresInCategory: FEATURE_VALUE[],
  activatedFeatures: string[]
): boolean => {
  return featuresInCategory.every((featureInCategory) => {
    return activatedFeatures.includes(featureInCategory);
  });
};

export const isUserFeature = (feature: FEATURE_VALUE): boolean => {
  return featureCategory.third_party.includes(feature);
};
