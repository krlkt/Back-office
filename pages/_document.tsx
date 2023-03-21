import React from 'react';
import { Head, Html, Main, NextScript } from 'next/document';

export const BackofficeWebAppDocument = () => {
  return (
    <Html lang="en">
      <Head>
        <link rel="shortcut icon" href="/img/Favicon_backoffice_app_v2.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default BackofficeWebAppDocument;
