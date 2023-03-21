import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import {
  getHostnameEndpoint,
  googleClientId,
  googleClientSecret,
} from '../../components-backend/config/env';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useErrorSnackbar } from './errorSnackbar';

export default function AuthenticationContext({
  children,
}: {
  children: JSX.Element;
}) {
  const { push } = useRouter();
  const { navigationErrorAsSnackbar } = useErrorSnackbar();
  const onRemoveUser = useCallback(() => {
    push('/').catch(navigationErrorAsSnackbar);
  }, [push, navigationErrorAsSnackbar]);

  return (
    <AuthProvider {...oidcConfig} onRemoveUser={onRemoveUser}>
      {children}
    </AuthProvider>
  );
}

const scopes = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
];

const oidcConfig: AuthProviderProps = {
  authority: 'https://accounts.google.com',
  client_id: googleClientId(),
  client_secret: googleClientSecret(),
  redirect_uri: `${getHostnameEndpoint()}/login/google/callback`,
  automaticSilentRenew: true,
  revokeTokensOnSignout: true,
  scope: scopes.join(' '),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
