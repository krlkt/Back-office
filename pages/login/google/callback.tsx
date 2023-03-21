import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useErrorSnackbar } from '../../../components-frontend/hooks/errorSnackbar';

export default function GoogleCallback() {
  const { push } = useRouter();
  const { navigationErrorAsSnackbar } = useErrorSnackbar();

  useEffect(() => {
    push('/').catch(navigationErrorAsSnackbar);
  }, [navigationErrorAsSnackbar, push]);
  return <></>;
}
