import { useRouter } from 'next/router';
import FeatureToggle from '../../../components-frontend/FeatureToggle';
import Layout from '../../../components-frontend/Layout';
import { withAuthentication } from '../../../components-frontend/hooks/authentication';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { TenantDTO } from '../../../components-shared/tenant-def';
import { useAuthenticatedAxios } from '../../../components-frontend/lib/getClientAxios';
import { useSnackbar } from 'notistack';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppEnv } from '../../../components-frontend/hooks/useAppEnv';
import Image from 'next/image';
import _ from 'lodash';
import { EmployeeLoginTokenDTO } from '../../../components-shared/employee-login-def';
import DeleteTenantDialog from '../../../components-frontend/dialog/DeleteTenantDialog';
import { FEATURE_VALUE } from '../../../components-shared/featureWrapper';
import { convertBase64ToPngSrc } from '../../../components-frontend/lib/base64';
import UploadImageDialog from '../../../components-frontend/dialog/UploadImageDialog';

const TenantDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const { appURL } = useAppEnv();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantDTO | null>(null);
  const [tenantOnLoad, setTenantOnLoad] = useState<TenantDTO | null>(null);
  const [isChanged, setIsChanged] = useState(tenant != tenantOnLoad);
  const [toDeleteId, setToDeleteId] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const authenticatedAxios = useAuthenticatedAxios();
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    if (!authenticatedAxios || !id || Array.isArray(id)) {
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedAxios.get<TenantDTO>(
        `/tenant/${encodeURIComponent(id)}`
      );
      setTenant(response.data || null);
      setTenantOnLoad(response.data || null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        'Failed to fetch tenant, unknown reason';
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  }, [authenticatedAxios, enqueueSnackbar, id]);

  useEffect(() => {
    load();
  }, [authenticatedAxios, enqueueSnackbar, id, load]);

  useEffect(() => {
    setIsChanged(!_.isEqual(tenant, tenantOnLoad));
  }, [tenant, tenantOnLoad]);

  const setNameCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTenant((tenant) =>
        tenant
          ? {
              ...tenant,
              name: event.target.value,
            }
          : null
      );
    },
    []
  );

  const setCompanyLanguageCallback = useCallback(
    (event: SelectChangeEvent<string>) => {
      setTenant((tenant) =>
        tenant
          ? {
              ...tenant,
              companyLanguage: event.target.value,
            }
          : null
      );
    },
    []
  );

  const setFeaturesCallback = useCallback(
    (featuresModifier: (features: FEATURE_VALUE[]) => FEATURE_VALUE[]) => {
      setTenant((tenant) =>
        tenant
          ? {
              ...tenant,
              features: featuresModifier(tenant?.features || []) || [],
            }
          : null
      );
    },
    []
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const updateTenantCallback = useCallback(() => {
    const update = async () => {
      if (!authenticatedAxios) {
        return;
      }

      setIsUpdating(true);
      try {
        await authenticatedAxios.post<TenantDTO>(`/tenant/update`, tenant);
      } catch (error) {
        setIsUpdating(false);
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Failed to update tenant, unknown reason';
        console.error(errorMessage, error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
      setIsUpdating(false);
      enqueueSnackbar('Updated', { variant: 'success' });
    };
    update();
  }, [authenticatedAxios, enqueueSnackbar, tenant]);

  const loginCallback = useCallback(() => {
    const update = async () => {
      if (!authenticatedAxios || !tenant?.id || !tenant) {
        return;
      }

      let employeeLogin: EmployeeLoginTokenDTO;
      setIsUpdating(true);
      try {
        employeeLogin = (
          await authenticatedAxios.post<
            TenantDTO,
            AxiosResponse<EmployeeLoginTokenDTO>
          >(`/tenant/addEmployee`, {
            tenantId: tenant.id,
          })
        ).data;
      } catch (error) {
        setIsUpdating(false);
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Failed to login, unknown reason';
        console.error(errorMessage, error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
      setIsUpdating(false);
      window.open(
        `${appURL}/actions/sso-login#ssoLoginToken=${
          employeeLogin.token
        }&tenantId=${encodeURIComponent(employeeLogin.tenantId)}`
      );
    };
    update();
  }, [appURL, authenticatedAxios, enqueueSnackbar, tenant]);

  const onDeleteSuccess = useCallback(() => {
    setToDeleteId('');
    router.push('/tenant/manage');
  }, [router]);

  const onUploadSuccess = useCallback(() => {
    setShowUploadDialog(false);
    load();
  }, [load]);

  const handleCloseDialog = useCallback(() => {
    setToDeleteId('');
  }, []);

  const handleClickDeleteTenant = useCallback(() => {
    setToDeleteId(tenant?.id || '');
  }, [tenant?.id]);

  const toggleUploadDialog = useCallback(() => {
    setShowUploadDialog(!showUploadDialog);
  }, [showUploadDialog]);

  return (
    <Layout loading={loading}>
      <DeleteTenantDialog
        onDeleteSuccess={onDeleteSuccess}
        toDeleteId={toDeleteId || ''}
        onCloseDialog={handleCloseDialog}
      />
      <UploadImageDialog
        showDialog={showUploadDialog}
        onUploadSuccess={onUploadSuccess}
        tenantId={tenant?.id || ''}
        toggleShowDialog={toggleUploadDialog}
      />
      <div className="container w-full">
        <div className="flex space-x-4 justify-between items-center mb-4">
          <div className="flex space-x-4 items-center">
            {tenant?.logoAsBase64 && (
              <div className="w-16 h-16 relative mr-4">
                <Image
                  src={convertBase64ToPngSrc(tenant?.logoAsBase64) || ''}
                  alt="company logo"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            )}

            <h1 className="mb-4 text-2xl text-gray-800 whitespace-nowrap font-bold">
              {id}
            </h1>
          </div>
          <div id="changeLogo" className="mb-4">
            <Button
              variant="outlined"
              onClick={toggleUploadDialog}
              className="h-12"
            >
              Change company logo
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 items-center mb-4">
          <TextField
            id="name"
            label="Name"
            variant="outlined"
            required
            fullWidth
            className="col-span-4"
            value={tenant?.name || ''}
            onChange={setNameCallback}
          />
          <FormControl className="col-span-2">
            <InputLabel id="company-language-select-label">
              Company Language
            </InputLabel>
            <Select
              labelId="company-language-select-label"
              id="company-language"
              value={tenant?.companyLanguage || ''}
              label="company-language"
              onChange={setCompanyLanguageCallback}
              fullWidth
            >
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
          <div className="col-span-1"></div>
          <Button
            variant="outlined"
            endIcon={<DeleteIcon />}
            onClick={handleClickDeleteTenant}
            className="my-2 h-12 text-deleteRed border-deleteRed hover:bg-deleteRed hover:bg-opacity-5 col-span-2"
            fullWidth
            disableFocusRipple
          >
            Delete tenant
          </Button>
          <Button
            variant="outlined"
            endIcon={<LoginIcon />}
            onClick={loginCallback}
            className="my-2 col-span-2 h-12"
            fullWidth
          >
            Login as admin
          </Button>
          <Button
            variant="contained"
            onClick={updateTenantCallback}
            disabled={
              !isChanged ||
              isUpdating ||
              !tenant?.features?.length ||
              !tenant?.name ||
              !tenant?.companyLanguage
            }
            className="bg-blue-600 my-2 col-span-1 h-12 disabled:bg-gray-500"
            fullWidth
          >
            Save
          </Button>
        </div>
        <FeatureToggle
          features={tenant?.features || []}
          onFeaturesChanged={setFeaturesCallback}
        />
      </div>
    </Layout>
  );
};

export default withAuthentication(TenantDetail);
