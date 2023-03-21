import { FeatureDTO, TenantDTO } from '../../components-shared/tenant-def';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useAuthenticatedAxios } from '../../components-frontend/lib/getClientAxios';
import axios, { AxiosError } from 'axios';
import Layout from '../../components-frontend/Layout';
import { withAuthentication } from '../../components-frontend/hooks/authentication';
import {
  FEATURE_VALUE,
  translateFeatureId,
} from '../../components-shared/featureWrapper';
import CustomPagination, {
  RowProps,
} from '../../components-frontend/pagination/CustomPagination';
import SearchField from '../../components-frontend/SearchField';
import { UserDTO, UsersDTO } from '../../components-shared/user-def';
import UserMetaView from '../../components-frontend/UserMetaView';

const FeatureDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [userMetaView, setUserMetaView] = useState<UserDTO[]>([]);
  const [tenantMetaView, setTenantMetaView] = useState('');
  const [feature, setFeature] = useState<FeatureDTO | null>(null);
  const [filledTenants, setFilledTenants] = useState<RowProps[]>([]);
  const [searchField, setSearchField] = useState('');

  const authenticatedAxios = useAuthenticatedAxios();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadFeatures = async () => {
      if (!authenticatedAxios || !id) {
        return;
      }

      setLoading(true);
      try {
        const response = await authenticatedAxios.get<FeatureDTO>(
          `/feature/${id}`
        );
        setFeature(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Failed to fetch feature, unknown reason';
        console.error(errorMessage, error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    };
    loadFeatures();
  }, [authenticatedAxios, enqueueSnackbar, id]);

  const setSearchFieldCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchField(event.target.value);
    },
    []
  );

  const onUserFeatureClicked = useCallback(
    (payload: {
      readonly usersUsingFeature: UserDTO[];
      readonly tenant: TenantDTO;
    }) => {
      setTenantMetaView(payload.tenant.name);
      setUserMetaView(payload.usersUsingFeature);
    },
    []
  );

  useEffect(() => {
    const loadFilledTenants = async () => {
      setLoading(true);
      const tenantAsRows: RowProps[] = (feature?.tenants || []).map(
        (tenant) => ({
          id: tenant.id,
          name: tenant.name,
          link: `/tenant/manage/${encodeURIComponent(tenant.id)}`,
          children: feature?.id && (
            <UserUsingFeature
              tenant={tenant}
              featureId={feature.id}
              onClick={onUserFeatureClicked}
            />
          ),
        })
      );
      const filteredRows = tenantAsRows.filter(function (row) {
        const rowName = row.name.toLowerCase();
        return rowName.indexOf(searchField.toLowerCase()) > -1;
      });
      setFilledTenants(filteredRows);
      setLoading(false);
    };
    loadFilledTenants();
  }, [feature?.id, feature?.tenants, onUserFeatureClicked, searchField]);

  const onCloseMetaView = useCallback(() => {
    setUserMetaView([]);
    setTenantMetaView('');
  }, []);

  return (
    <Layout loading={loading}>
      <div>
        {feature && (
          <div className="grid grid-cols-10 gap-2 relative">
            <div className="col-span-7">
              <h1 className="mb-6 text-xl">
                Tenant Name:{' '}
                <b>{translateFeatureId(feature.id as FEATURE_VALUE)}</b>
              </h1>

              <div className="p-4"></div>
              <div className="w-[48rem] divide-y-4">
                <div className="flex justify-between items-end">
                  <h2 className="custom-heading-2 text-2xl mb-2">Used by</h2>
                  <SearchField
                    textValue={searchField}
                    setSearchFieldCallback={setSearchFieldCallback}
                    className="w-[16rem]"
                  />
                </div>
                <CustomPagination items={filledTenants} />
              </div>

              <div className="p-4"></div>
            </div>
            {userMetaView.length > 0 && (
              <div className="col-span-3">
                <div className="sticky top-10">
                  <UserMetaView
                    tenantName={tenantMetaView}
                    users={userMetaView}
                    onCloseMetaView={onCloseMetaView}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

const UserUsingFeature = ({
  tenant,
  featureId,
  onClick,
}: {
  readonly tenant: TenantDTO;
  readonly featureId: string;
  readonly onClick: (payload: {
    readonly usersUsingFeature: UserDTO[];
    readonly tenant: TenantDTO;
  }) => void;
}) => {
  const authenticatedAxios = useAuthenticatedAxios();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserDTO[]>([]);
  useEffect(() => {
    if (!authenticatedAxios) {
      setUsers([]);
      return;
    }

    const controller = new AbortController();
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await authenticatedAxios.get<UsersDTO>(
          `/tenant/${encodeURIComponent(tenant.id)}/getUsers`,
          {
            signal: controller.signal,
          }
        );
        setUsers(response.data?.users || []);
        setLoading(false);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.code === AxiosError.ERR_CANCELED
        ) {
          console.debug(`users requests to ${tenant.id} cancelled`);
          return;
        }
        throw error;
      }
    };

    loadUser().catch((error) => {
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        `Failed to fetch users from ${tenant.id}, unknown reason`;
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    });

    return () => controller.abort();
  }, [tenant.id, authenticatedAxios, enqueueSnackbar]);

  const [usersUsingFeature, setUsersUsingFeature] = useState<UserDTO[]>([]);
  useEffect(() => {
    setUsersUsingFeature(
      users.filter((user) => user.featureIds.includes(`${featureId}-user`))
    );
  }, [users, featureId]);

  const onClickCallback = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick({ usersUsingFeature, tenant });
    },
    [onClick, usersUsingFeature, tenant]
  );

  return (
    <>
      <div className="flex grow justify-end space-x-3">
        {loading && (
          <div className="w-4 h-6 border-b-2 border-gray-900 rounded-full animate-spin" />
        )}
        {!loading && (
          <>
            {usersUsingFeature.length > 0 && (
              <button
                className="w-24 px-4 rounded-lg py-1 bg-blue-200 hover:bg-blue-300 transition duration-300"
                onClick={onClickCallback}
              >
                <div className="flex items-center	justify-center">
                  <p className="text-md opacity-90 hover:opacity-100 text-center">
                    {`${usersUsingFeature.length} ${
                      usersUsingFeature.length > 1 ? 'users' : 'user'
                    }`}
                  </p>
                </div>
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default withAuthentication(FeatureDetail);
