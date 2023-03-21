import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthentication } from '../../components-frontend/hooks/authentication';
import { useErrorSnackbar } from '../../components-frontend/hooks/errorSnackbar';

export default function Login() {
  const router = useRouter();
  const { isLoading, isAuthenticated, signIn } = useAuthentication();
  const { navigationErrorAsSnackbar } = useErrorSnackbar();
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.push('/tenant/manage').catch(navigationErrorAsSnackbar);
    }
  }, [isLoading, isAuthenticated, router, navigationErrorAsSnackbar]);

  return (
    <div className="h-[calc(100vh_-_6rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Back office</title>
      </Head>
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Image
            className="mx-auto h-12 w-auto"
            src="/img/logo_login.svg"
            alt="caralegal logo"
            width={380}
            height={100}
          />
        </div>
        <div className="mt-4 space-y-6">
          <div>
            <button
              onClick={signIn}
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
