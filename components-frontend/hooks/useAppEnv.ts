import { useEffect, useState } from 'react';

export type AppEnv = 'dev' | 'stage' | 'prod';

export const useAppEnv = (): { appEnv: AppEnv; appURL: string } => {
  const [appEnv, setAppEnv] = useState<AppEnv>('prod');
  useEffect(() => {
    const domainName = window.location.hostname || '';
    if (
      domainName.includes('dev-caralegal') ||
      domainName.includes('localhost')
    ) {
      setAppEnv('dev');
      return;
    }
    if (domainName.includes('stage-caralegal')) {
      setAppEnv('stage');
      return;
    }
  }, []);

  const [appURL, setAppURL] = useState('https://app.caralegal.eu');
  useEffect(() => {
    switch (appEnv) {
      case 'prod':
        setAppURL('https://app.caralegal.eu');
        break;
      case 'stage':
        setAppURL('https://stage.app.caralegal.eu');
        break;
      case 'dev':
        setAppURL('https://dev.app.caralegal.eu');
        break;
      default:
        throw new Error('Unable to detect environment');
    }
  }, [appEnv]);

  return { appEnv, appURL };
};
