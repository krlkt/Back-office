import * as React from 'react';
import '../styles/globals.css';
import '../styles/font.css';
import { AppProps } from 'next/app';
import { SnackbarProvider } from 'notistack';
import AuthenticationContext from '../components-frontend/hooks/AuthenticationContext';

export default function BackofficeApp({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <AuthenticationContext>
        <Component {...pageProps} />
      </AuthenticationContext>
    </SnackbarProvider>
  );
}
