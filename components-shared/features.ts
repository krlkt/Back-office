export const FEATURES = {
  DATAFLOW_UPLOAD: 'dataFlowUpload',
  PA_TEMPLATES: 'paTemplates',
  PA_EXCEL_EXPORT: 'paExcelExport',
  EDT_TEMPLATES: 'edtTemplates',
  ER_EXPORT: 'erExport',
  TOM_TEMPLATES: 'tomTemplates',
  DATA_SUBJECT_POTENTIAL_AMOUNT: 'dataSubjectPotentialAmount',
  DPA_LEGAL_REVIEW: 'DPALegalReview',
  DATA_CLASSIFICATION: 'dataClassification',
  DEEP_L: 'deepLApi',
  DATA_BREACHES: 'dataBreaches',
  DSR_BASIC_SUBMISSION: 'dsrBasicSubmission',
  DSR_EXPORT: 'dsrExport',
  EXPERIMENTAL: 'experimental',
  RISKS: 'risks',
  LANGUAGE_FR: 'languageFR',
  LANGUAGE_CZ: 'languageCZ',
  LANGUAGE_PL: "languagePL",
  CONTACT_INFO_PROFILES: 'contactInfoProfiles',
  TASK_SEEN_BY_USER: 'taskSeenByUser',
  RISKS_ON_PA_SUBMISSION: 'risksOnProcessSubmission',
  OWLIT: 'owlit',
  USER_FEATURES: 'userFeatures',
  RECURRING_TASK: 'recurringTasks',
  LINK_LEGAL_RETENTION_PERIODS_TO_ORG_UNITS:
    'linkLegalRetentionPeriodsToOrgUnits',
  DELETION_CONCEPT: 'deletionConcept',
  RESOURCES_DELETION_TRIGGER: 'deletionTrigger',
  ASSETS: 'assets',
  WEBSITES: 'websites',
  RESOURCES_CUSTOM_CONTRACT_TYPE: 'resourceCustomContractType',
  RESOURCES_CUSTOM_REQUEST_TYPE: 'resourceCustomRequestType',
  DATA_BREACHES_DATA_SUBJECT_INFORMED: 'dataBreachesDataSubjectInformed',
  FILE_UPLOAD_ON_PROCESSING_ACTIVITIES: 'fileUploadOnProcessingActivities',
  EXTERNAL_RECIPIENTS_INSIGHT_DATA: 'externalRecipientsInsightData',
} as const;

export const USER_FEATURE_IDS = {
  OWLIT_USER: 'owlit-user',
  WEBSITES: 'websites-user',
} as const;

export const DEFAULT_FEATURES = [
  FEATURES.DATA_BREACHES,
  FEATURES.ER_EXPORT,
  FEATURES.DSR_EXPORT,
  FEATURES.PA_EXCEL_EXPORT,
];
