import Layout from '../../components-frontend/Layout';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import { ChangeEvent, useCallback, useState } from 'react';
import { withAuthentication } from '../../components-frontend/hooks/authentication';
import { TenantCreationDTO } from '../../components-shared/tenant-def';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import FeatureToggle from '../../components-frontend/FeatureToggle';
import { DEFAULT_FEATURES } from '../../components-shared/features';
import { useAuthenticatedAxios } from '../../components-frontend/lib/getClientAxios';
import { useRouter } from 'next/router';
import { FEATURE_VALUE } from '../../components-shared/featureWrapper';

function CreateTenant() {
  const authenticatedAxios = useAuthenticatedAxios();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [tenantName, setTenantName] = useState('');
  const [companyLanguage, setCompanyLanguage] = useState('de');
  const [features, setFeatures] = useState<FEATURE_VALUE[]>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(false);

  const createTenantCallback = useCallback(async () => {
    if (!authenticatedAxios) {
      return;
    }
    const createTenantPayload: TenantCreationDTO = {
      tenantName,
      companyLanguage,
      features,
    };
    setLoading(true);
    try {
      const result = await authenticatedAxios.post(
        '/tenant/create',
        createTenantPayload
      );
      enqueueSnackbar('Successfully created tenant', { variant: 'success' });
      router.push(`/tenant/manage/${result.data.tenantId}`);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error instanceof AxiosError && error.response?.data?.message) ||
        'Failed to create tenant, unknown reason';
      console.error(errorMessage, error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
    setLoading(false);
  }, [
    authenticatedAxios,
    tenantName,
    companyLanguage,
    features,
    enqueueSnackbar,
    router,
  ]);

  const setTenantNameCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setTenantName(event.target.value),
    []
  );
  const setCompanyLanguageCallback = useCallback(
    (event: SelectChangeEvent) => setCompanyLanguage(event.target.value),
    []
  );

  return (
    <Layout loading={loading}>
      <div className="container">
        <FormControl className="w-full">
          <h2 className="custom-heading-2">Tenant</h2>
          <div className="flex justify-between space-x-6 items-center">
            <TextField
              id="tenant-name"
              label="Tenant name"
              variant="outlined"
              required
              fullWidth
              margin="normal"
              className="w-[46rem]"
              value={tenantName}
              onChange={setTenantNameCallback}
            />

            <FormControl className="w-full" margin="normal">
              <InputLabel id="company-language-select-label">
                Company Language
              </InputLabel>

              <Select
                labelId="company-language-select-label"
                id="company-language"
                value={companyLanguage}
                label="company-language"
                onChange={setCompanyLanguageCallback}
                fullWidth
                className="w-[10rem]"
              >
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              endIcon={<CreateIcon />}
              onClick={createTenantCallback}
              disabled={loading}
              className="bg-blue-600 my-2 w-[10rem] h-14"
              fullWidth
            >
              {loading && <CircularProgress size={'1.5rem'} className="mr-2" />}
              Create
            </Button>
          </div>

          <FeatureToggle features={features} onFeaturesChanged={setFeatures} />
        </FormControl>
      </div>
    </Layout>
  );
}

export default withAuthentication(CreateTenant);
