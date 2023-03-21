import Layout from '../../components-frontend/Layout';
import React, { useCallback, useEffect, useState } from 'react';
import { withAuthentication } from '../../components-frontend/hooks/authentication';
import {
  FEATURE_VALUE,
  getAllFeatures,
  translateFeatureId,
} from '../../components-shared/featureWrapper';
import { useAuthenticatedAxios } from '../../components-frontend/lib/getClientAxios';
import { TenantDTO, TenantsDTO } from '../../components-shared/tenant-def';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import Link from 'next/link';

export interface TenantFeatureRowProps {
  readonly id: string;
  readonly name: string;
  readonly tenantsUsingTheFeature: TenantDTO[];
}

const allFeatures = getAllFeatures().sort((a, b) =>
  translateFeatureId(a).localeCompare(translateFeatureId(b))
);

function Features() {
  const { enqueueSnackbar } = useSnackbar();
  const authenticatedAxios = useAuthenticatedAxios();

  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [featureRows, setFeatureRows] = useState<TenantFeatureRowProps[]>([]);

  const reloadTenants = useCallback(() => {
    if (!authenticatedAxios) {
      return;
    }

    setLoading(true);
    const loadTenants = async () => {
      const response = await authenticatedAxios.get<TenantsDTO>('/tenant');
      setTenants(
        (response.data.tenants || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setLoading(false);
    };

    loadTenants().catch((error) => {
      setLoading(false);
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        'Failed to fetch tenants, unknown reason';
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    });
  }, [authenticatedAxios, enqueueSnackbar]);

  useEffect(() => {
    reloadTenants();
  }, [reloadTenants]);

  useEffect(() => {
    const featureAsRows: TenantFeatureRowProps[] = allFeatures.map(
      (feature) => ({
        id: feature,
        name: translateFeatureId(feature),
        tenantsUsingTheFeature: tenants.filter((tenant) =>
          tenant.features.includes(feature)
        ),
      })
    );
    setFeatureRows(featureAsRows);
  }, [tenants]);

  return (
    <Layout loading={loading}>
      <h2 className="custom-heading-2 text-2xl mb-2">Tenant Features</h2>
      <FeaturesTable featureRows={featureRows} />
    </Layout>
  );
}

function FeaturesTable({
  featureRows,
}: {
  featureRows: TenantFeatureRowProps[];
}) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-4 inline-block min-w-[70%] sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-left border-b table-fixed">
              <thead className="border-b bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="text-sm font-medium text-white px-6 py-4 w-1/2 "
                  >
                    Feature name
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-white px-6 py-4 text-right"
                  >
                    Used by
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((featureRows) => {
                  return (
                    <Link
                      key={featureRows.id}
                      href={`/feature/${featureRows.id}`}
                    >
                      <tr className="bg-white border-b hover:bg-gray-50 hover:cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {translateFeatureId(
                            featureRows.name as FEATURE_VALUE
                          )}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap text-right">
                          {featureRows.tenantsUsingTheFeature?.length || 0}{' '}
                          Tenant(s)
                        </td>
                      </tr>
                    </Link>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthentication(Features);
