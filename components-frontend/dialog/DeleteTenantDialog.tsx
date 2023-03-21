import React, { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedAxios } from '../lib/getClientAxios';
import { TenantTargetDTO } from '../../components-shared/tenant-def';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import CustomDialog from './CustomDeleteDialog';

export default function DeleteTenantDialog({
  onDeleteSuccess,
  toDeleteId,
  onCloseDialog,
}: {
  onDeleteSuccess?: () => void;
  toDeleteId: string;
  onCloseDialog?: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const authenticatedAxios = useAuthenticatedAxios();

  const [loading, setLoading] = useState(false);
  const [toDeleteName, setToDeleteName] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (toDeleteId) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [toDeleteId]);

  const fetchTenantNameCallback = useCallback(async () => {
    if (!authenticatedAxios) {
      return;
    }

    if (!toDeleteId) {
      setToDeleteName('');
      return;
    }

    setLoading(true);
    try {
      const tenant = await authenticatedAxios.get(`/tenant/${toDeleteId}`);
      setToDeleteName(tenant.data.name);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        'Failed to fetch tenant, unknown reason';
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
    setLoading(false);
  }, [authenticatedAxios, toDeleteId, enqueueSnackbar]);

  useEffect(() => {
    fetchTenantNameCallback();
  }, [fetchTenantNameCallback]);

  const deleteSelectedTenantCallback = useCallback(async () => {
    if (!authenticatedAxios) {
      return;
    }

    const deleteTenantPayload: TenantTargetDTO = {
      tenantId: toDeleteId,
    };

    setLoading(true);
    try {
      await authenticatedAxios.post('/tenant/delete', deleteTenantPayload);
      enqueueSnackbar('Successfully deleted tenant', { variant: 'success' });
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        'Failed to delete tenant, unknown reason';
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
    setLoading(false);

    onDeleteSuccess?.();
  }, [authenticatedAxios, toDeleteId, onDeleteSuccess, enqueueSnackbar]);

  return (
    <CustomDialog
      showDialog={showDialog}
      handleCloseDialog={onCloseDialog}
      primaryButtonOnClick={deleteSelectedTenantCallback}
      loading={loading}
      confirmationText={toDeleteName}
      customWarningText={
        <>
          This action <b>cannot</b> be undone. This will permanently delete the
          tenant:
          <h4 className="whitespace-pre relative text-lg text-white bg-red-500 bg-opacity-95 shadow-lg my-3 rounded-md py-2 px-3">
            {toDeleteName}
          </h4>
          Please type in <b className="whitespace-pre">{toDeleteName}</b> to
          confirm.
        </>
      }
    />
  );
}
