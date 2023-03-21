import { useEffect, useState } from 'react';
import { useAppEnv } from './useAppEnv';

export const useDev = () => {
  const { appEnv } = useAppEnv();
  const [devMode, setDevMode] = useState(false);
  useEffect(() => {
    setDevMode(appEnv === 'dev');
  }, [appEnv]);

  return { devMode };
};
