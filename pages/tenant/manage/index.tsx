import Layout from '../../../components-frontend/Layout';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { TenantDTO, TenantsDTO } from '../../../components-shared/tenant-def';
import { withAuthentication } from '../../../components-frontend/hooks/authentication';
import { useSnackbar } from 'notistack';
import { useAuthenticatedAxios } from '../../../components-frontend/lib/getClientAxios';
import { AxiosError } from 'axios';
import CustomPagination, {
  RowProps,
} from '../../../components-frontend/pagination/CustomPagination';
import DeleteTenantDialog from '../../../components-frontend/dialog/DeleteTenantDialog';
import SearchField from '../../../components-frontend/SearchField';

function ManageTenant() {
  const { enqueueSnackbar } = useSnackbar();
  const authenticatedAxios = useAuthenticatedAxios();

  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [filledTenants, setFilledTenants] = useState<RowProps[]>([]);
  const [searchField, setSearchField] = useState('');

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

  const [toDeleteId, setToDeleteId] = useState('');

  const handleClickDeleteTenant = useCallback((tenantId: string) => {
    setToDeleteId(tenantId);
  }, []);

  const setSearchFieldCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchField(event.target.value);
    },
    []
  );
  useEffect(() => {
    const tenantAsRows = tenants as RowProps[];
    const filledRows: RowProps[] = tenantAsRows
      .filter(function (row) {
        const rowName = row.name.toLowerCase();
        return rowName.indexOf(searchField.toLowerCase()) > -1;
      })
      .map((tenant) => {
        (tenant.link as string) = `/tenant/manage/${encodeURIComponent(
          tenant.id
        )}`;
        tenant.onDeleteIconClick = handleClickDeleteTenant;
        return tenant;
      });
    setFilledTenants(filledRows);
  }, [handleClickDeleteTenant, searchField, tenants]);

  const onDeleteTenant = useCallback(() => {
    setToDeleteId('');
    reloadTenants();
  }, [reloadTenants]);

  const handleCloseDialog = useCallback(() => {
    setToDeleteId('');
  }, []);

  return (
    <Layout loading={loading}>
      <DeleteTenantDialog
        onDeleteSuccess={onDeleteTenant}
        toDeleteId={toDeleteId}
        onCloseDialog={handleCloseDialog}
      />
      <div className="w-[48rem] divide-y-4">
        <div className="flex justify-between items-end">
          <h2 className="custom-heading-2 text-2xl mb-2">Tenant List</h2>
          <SearchField
            textValue={searchField}
            setSearchFieldCallback={setSearchFieldCallback}
            className="w-[16rem]"
          />
        </div>
        <CustomPagination items={filledTenants} />
      </div>
    </Layout>
  );
}

export default withAuthentication(ManageTenant);
