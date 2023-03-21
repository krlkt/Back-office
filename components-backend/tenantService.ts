import { getFirebaseAuth, getFirestore, getStorage } from './config/firebase';
import listOfDefaultValues from './tenantDefaultValues';
import { getUserEventPublisher } from './config/kafka';
import { TenantDTO, TenantUpdateDTO } from '../components-shared/tenant-def';
import { removeEqualOrUndefined } from './utils/removeEqualOrUndefined';
import { getBackendAxios } from './config/axios';
import { userAPIKey, userEndpoint } from './config/env';
import { EmployeeLoginTokenDTO } from '../components-shared/employee-login-def';
import { UsersDTO } from '../components-shared/user-def';

export const deleteTenant = async (
  tenantId: string,
  employeeUID: string
): Promise<void> => {
  if (!tenantId) {
    throw new Error("Tenant id can't be empty for deletion");
  }

  const db = getFirestore();
  const auth = getFirebaseAuth();
  const tenantRef = db.collection('tenant').doc(tenantId);

  const userIdsToBeDeleted = await tenantRef
    .collection('users')
    .get()
    .then((s) => s.docs.map((d) => d.id));
  await Promise.all(userIdsToBeDeleted.map((uid) => auth.deleteUser(uid)));
  await db.recursiveDelete(tenantRef);

  await (
    await getUserEventPublisher()
  ).publish({
    eventType: 'tenant/deleted',
    userType: 'employee',
    userId: employeeUID,
    tenantId: tenantId,
    payload: {},
  });
};

export const getTenants = async (): Promise<TenantDTO[]> => {
  const db = getFirestore();
  const tenantsSnapshot = await db.collection('tenant').get();
  return tenantsSnapshot.docs.map((tenantsSnapshot) => ({
    id: tenantsSnapshot.id,
    name: tenantsSnapshot.data().name || '',
    companyLanguage: tenantsSnapshot.data().companyLanguage || '',
    features: tenantsSnapshot.data().features || [],
  }));
};

export const getTenant = async (
  tenantId: string
): Promise<TenantDTO | null> => {
  const db = getFirestore();
  const tenantSnapshot = await db.collection('tenant').doc(tenantId).get();
  const logoAsBase64 = await downloadTenantLogoIfExists(tenantId);

  const tenantData = tenantSnapshot.data();
  if (!tenantData) {
    return null;
  }

  return {
    id: tenantSnapshot.id,
    name: tenantData.name || '',
    companyLanguage: tenantData.companyLanguage || '',
    features: tenantData.features || [],
    logoAsBase64: logoAsBase64,
  };
};

export const updateTenant = async (
  tenantId: string,
  tenantUpdate: Omit<TenantUpdateDTO, 'id'>,
  employeeUID: string
): Promise<void> => {
  if (!tenantId) {
    throw new Error("Tenant id can't be empty for deletion");
  }

  const tenantRef = getFirestore().collection('tenant').doc(tenantId);
  const existingTenant = await tenantRef.get();
  if (!existingTenant.exists) {
    throw new Error(`Tenant id ${tenantId} does not exist!`);
  }

  const orgUnits = await tenantRef.collection('org_units').get();
  const rootOrgUnit = orgUnits.docs.find(
    (orgUnit) => orgUnit.data().parentId === null
  );
  if (!rootOrgUnit) {
    throw new Error(`Tenant id ${tenantId} does not have a root org unit!`);
  }

  const updatePayloadWithoutUndefined: Partial<Omit<TenantUpdateDTO, 'id'>> =
    removeEqualOrUndefined<Omit<TenantUpdateDTO, 'id'>>(
      tenantUpdate,
      existingTenant.data() || {}
    );

  if (!Object.keys(updatePayloadWithoutUndefined).length) {
    return;
  }

  const batch = getFirestore().batch();
  batch.update(tenantRef, updatePayloadWithoutUndefined);
  if (updatePayloadWithoutUndefined.name) {
    batch.update(rootOrgUnit.ref, {
      name: updatePayloadWithoutUndefined.name,
    });
  }
  await batch.commit();

  await (
    await getUserEventPublisher()
  ).publish({
    eventType: 'tenant/updated',
    userType: 'employee',
    userId: employeeUID,
    tenantId: tenantId,
    payload: {
      tenantName: updatePayloadWithoutUndefined.name,
      companyLanguage: updatePayloadWithoutUndefined.companyLanguage,
      features: updatePayloadWithoutUndefined.features,
    },
  });
};

export const createTenantWithoutUser = async ({
  tenantName,
  companyLanguage,
  employeeUID,
  features,
}: {
  readonly tenantName: string;
  readonly companyLanguage: string;
  readonly employeeUID: string;
  readonly features: string[];
}): Promise<{ tenantId: string }> => {
  if (!tenantName || !companyLanguage) {
    throw new Error('A tenant should have a name and a company language');
  }

  const tenantData = {
    name: tenantName,
    created: new Date(),
    tenantProfileInfo: {},
    companyLanguage: companyLanguage.toLowerCase(),
    features: features,
  };

  const db = getFirestore();
  const batch = db.batch();

  // generate unique tenant name
  const tenantNameWithoutSpecialCharactersAndWhitespace = tenantName
    .replace(/\s+/g, '')
    // removes non alpha numeric characters
    .replace(/[^a-zA-Z0-9-]/g, '');
  const uniqueTenantId =
    tenantNameWithoutSpecialCharactersAndWhitespace + Date.now();
  const tenantRef = db.collection('tenant').doc(uniqueTenantId);
  const existingTenantDoc = await tenantRef.get();
  if (existingTenantDoc.exists) {
    throw new Error(`Tenant ID ${uniqueTenantId} already exists`);
  }

  // create new tenant
  batch.set(tenantRef, tenantData);

  // creates organization collection
  const rootOrgUnitRef = tenantRef.collection('org_units').doc();
  batch.set(rootOrgUnitRef, {
    name: tenantName,
    parentId: null,
    path: rootOrgUnitRef.id,
    ancestors_and_self: [rootOrgUnitRef.id],
  });

  // add default values to tenant
  const listsData = generateListsDefaultValues();
  batch.set(tenantRef.collection('resources').doc('lists'), listsData);

  await batch.commit();

  await (
    await getUserEventPublisher()
  ).publish({
    eventType: 'tenant/created',
    userType: 'employee',
    userId: employeeUID,
    tenantId: uniqueTenantId,
    payload: {
      tenantName: tenantName,
      companyLanguage: companyLanguage,
      showDev: false,
      features: features,
    },
  });

  // admin created
  return {
    tenantId: uniqueTenantId,
  };
};

export const addEmployeeAsTenantAdmin = async ({
  tenantId,
  employeeEmail,
}: {
  tenantId: string;
  employeeEmail: string;
}): Promise<EmployeeLoginTokenDTO> => {
  const response = await getBackendAxios().post(
    `${userEndpoint()}/api/admin/tenants/${encodeURIComponent(
      tenantId
    )}/employees`,
    {
      email: employeeEmail,
    },
    {
      headers: {
        Authorization: userAPIKey(),
      },
    }
  );
  return {
    tenantId: response.data.tenantId || '',
    token: response.data.token || '',
  };
};

export const addTestEmployees = async ({
  tenantId,
}: {
  tenantId: string;
}): Promise<{ tenantId: string; userIds: string[] }> => {
  const response = await getBackendAxios().post(
    `${userEndpoint()}/api/admin/tenants/${encodeURIComponent(
      tenantId
    )}/testusers`,
    {
      tenantId: tenantId,
    },
    {
      headers: {
        Authorization: userAPIKey(),
      },
    }
  );
  return {
    tenantId: response.data.tenantId || '',
    userIds: response.data.userIds || '',
  };
};

export const getAllUsersInTenant = async ({
  tenantId,
}: {
  tenantId: string;
}): Promise<UsersDTO> => {
  const response = await getBackendAxios().get<UsersDTO>(
    `${userEndpoint()}/api/admin/tenants/${encodeURIComponent(tenantId)}/users`,
    {
      headers: {
        Authorization: userAPIKey(),
      },
    }
  );
  return response.data;
};

const generateListsDefaultValues = (): Record<string, (object | string)[]> => {
  return {
    ...listOfDefaultValues,
    lists_legal_basis: listOfDefaultValues.lists_legal_basis.map(
      (legalBasis) => ({
        ...legalBasis,
        // add orgUnitsIds field to lists_legal_basis
        orgUnitsIds: ['*'],
      })
    ),
    lists_legal_retention_period:
      listOfDefaultValues.lists_legal_retention_period.map(
        (retentionPeriod) => ({
          ...retentionPeriod,
          // add orgUnitsIds field to lists_legal_basis
          orgUnitsIds: ['*'],
        })
      ),
    lists_data_locations: listOfDefaultValues.lists_data_locations.map(
      (dataLocation) => ({
        ...dataLocation,
        created: new Date(),
      })
    ),
    lists_internal_recipients:
      listOfDefaultValues.lists_internal_recipients.map(
        (internalRecipient) => ({
          ...internalRecipient,
          created: new Date(),
        })
      ),
  };
};

const localOption = process.env.FIREBASE_LOCAL ? { validation: false } : {};

export const uploadToTenantStorage = async ({
  tenantId,
  file,
}: {
  tenantId: string;
  file: Buffer;
}) => {
  const bucketTargetFile = getStorage().bucket().file(`${tenantId}/logo.png`);
  await bucketTargetFile.save(file, {
    ...localOption,
    contentType: 'image/png',
  });
};

const downloadTenantLogoIfExists = async (
  tenantId: string
): Promise<string | null> => {
  let contentsAsString = '';
  try {
    const [contents] = await getStorage()
      .bucket()
      .file(`${tenantId}/logo.png`)
      .download(localOption);

    contentsAsString = contents.toString('base64');
  } catch (e) {
    return null;
  }

  return contentsAsString;
};
