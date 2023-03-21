import axios, { AxiosInstance } from 'axios';

let _axios: AxiosInstance;
export const getBackendAxios = () => {
  if (!_axios) {
    _axios = axios.create({
      headers: {
        Accept: 'application/json',
      },
    });
    _axios.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  return _axios;
};
