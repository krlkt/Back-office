import { useAuthentication } from './../hooks/authentication';
import axios, { AxiosInstance } from 'axios';
import { getHostnameEndpoint } from '../../components-backend/config/env';
import { useEffect, useRef, useState } from 'react';

let _axios: AxiosInstance;
export const getClientAxios = (): AxiosInstance => {
  if (!_axios) {
    _axios = axios.create({
      baseURL: `${getHostnameEndpoint()}/api`,
      headers: {
        Accept: 'application/json',
      },
    });
    _axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(error.toJSON());
        console.error(error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  return _axios;
};

export const useAuthenticatedAxios = () => {
  const { authenticationToken, signOut } = useAuthentication();
  const [loaded, setLoaded] = useState(false);
  const authenticatedAxios = useRef<AxiosInstance>(getClientAxios());

  useEffect(() => {
    if (!authenticationToken) {
      setLoaded(false);
      return;
    }

    authenticatedAxios.current?.interceptors?.request.use((config) => {
      if (!config?.headers) {
        return;
      }
      config.headers['Authorization'] = authenticationToken || '';
      return config;
    });

    authenticatedAxios.current?.interceptors?.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          return signOut().then(() => Promise.reject(error));
        }
        console.error(error.toJSON());
        console.error(error.response?.data);
        return Promise.reject(error);
      }
    );
    setLoaded(true);
  }, [authenticationToken, signOut, authenticatedAxios]);

  return loaded ? authenticatedAxios.current : null;
};
