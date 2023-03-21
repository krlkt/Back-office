import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthentication } from '../components-frontend/hooks/authentication';
import { useErrorSnackbar } from '../components-frontend/hooks/errorSnackbar';

export const Index = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuthentication();
  const { navigationErrorAsSnackbar } = useErrorSnackbar();

  useEffect(() => {
    const init = async () => {
      if (isLoading) {
        return;
      }
      if (isAuthenticated) {
        await router.push('/tenant/manage');
      } else {
        await router.push('/login');
      }
    };

    init().catch(navigationErrorAsSnackbar);
  }, [router, isAuthenticated, navigationErrorAsSnackbar, isLoading]);

  return <></>;
};

export default Index;
