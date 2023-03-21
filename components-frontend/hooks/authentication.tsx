import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/router';
import { useErrorSnackbar } from './errorSnackbar';

export interface AuthenticatedUser {
  readonly email: string;
  readonly name: string;
  readonly picture: string;
}

export const useAuthentication = (): {
  readonly authenticationToken: string;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly user: AuthenticatedUser | null;
  readonly signOut: () => Promise<void>;
  readonly signIn: () => Promise<void>;
} => {
  const {
    isLoading,
    isAuthenticated,
    user: googleUser,
    removeUser,
    signinRedirect,
  } = useAuth();

  const [authenticationToken, setAuthenticationToken] = useState('');
  useEffect(() => {
    if (!googleUser?.id_token || !googleUser?.access_token) {
      setAuthenticationToken('');
      return;
    }

    const token = `${googleUser.id_token}:::${googleUser.access_token}`;
    setAuthenticationToken(`Bearer ${token}`);
  }, [googleUser?.access_token, googleUser?.id_token]);

  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  useEffect(() => {
    if (!googleUser?.profile.email) {
      setUser(null);
      return;
    }

    setUser({
      email: googleUser?.profile.email || '',
      name: googleUser?.profile.name || '',
      picture: googleUser?.profile.picture || '',
    });
  }, [
    googleUser?.profile.email,
    googleUser?.profile.name,
    googleUser?.profile.picture,
  ]);

  return {
    authenticationToken,
    isLoading,
    isAuthenticated,
    user,
    signOut: removeUser,
    signIn: signinRedirect,
  };
};

export const withAuthentication = (
  Component: () => JSX.Element
): (() => JSX.Element) => {
  const WithAuthentication = () => (
    <LoginScreenIfNotLoggedIn>
      <Component />
    </LoginScreenIfNotLoggedIn>
  );
  WithAuthentication.displayName = 'WithAuthentication';
  return WithAuthentication;
};

function LoginScreenIfNotLoggedIn({ children }: { children: JSX.Element }) {
  const { isLoading, isAuthenticated } = useAuthentication();
  const { push } = useRouter();
  const { navigationErrorAsSnackbar } = useErrorSnackbar();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      push('/').catch(navigationErrorAsSnackbar);
    }
  }, [isLoading, isAuthenticated, navigationErrorAsSnackbar, push]);
  if (isLoading) {
    return <></>;
  }

  return <>{children}</>;
}
