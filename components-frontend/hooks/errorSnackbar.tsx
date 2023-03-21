import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
import { AxiosError } from 'axios';

export const useErrorSnackbar = () => {
  const { enqueueSnackbar } = useSnackbar();

  const catchAsSnackbar = useCallback(
    (message: string) => {
      return (error: unknown) => {
        const errorMessageFromError =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message);

        enqueueSnackbar(errorMessageFromError || message, { variant: 'error' });
        console.error(message, errorMessageFromError || 'unknown', error);
      };
    },
    [enqueueSnackbar]
  );

  const navigationErrorAsSnackbar = useMemo(
    () => catchAsSnackbar('Navigation Error'),
    [catchAsSnackbar]
  );

  return { catchAsSnackbar, navigationErrorAsSnackbar };
};
