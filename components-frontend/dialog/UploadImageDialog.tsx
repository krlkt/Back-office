import React, { ChangeEvent, useCallback, useState } from 'react';
import { useAuthenticatedAxios } from '../lib/getClientAxios';
import { TenantLogoUpdateDTO } from '../../components-shared/tenant-def';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { convertFileToBase64 } from '../lib/base64';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Image from 'next/image';

export default function UploadImageDialog({
  tenantId,
  showDialog,
  toggleShowDialog,
  onUploadSuccess,
}: {
  tenantId: string;
  showDialog: boolean;
  onUploadSuccess?: () => void;
  toggleShowDialog?: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const authenticatedAxios = useAuthenticatedAxios();

  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [displayLogo, setDisplayLogo] = useState<string | null>(null);

  const handleSelectFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        if (event.target.files?.length > 1) {
          const errorMessage =
            'Failed to select img, please only provide 1 png file';
          console.error(errorMessage);
          enqueueSnackbar(errorMessage, { variant: 'error' });
          throw new Error(errorMessage);
        }
        setLogoImage(event.target.files[0]);
        setDisplayLogo(URL.createObjectURL(event.target.files[0]));
      }
    },
    [enqueueSnackbar]
  );

  const handleUploadImage = useCallback(async () => {
    const uploadImage = async () => {
      if (
        !authenticatedAxios ||
        !logoImage ||
        !tenantId ||
        Array.isArray(tenantId)
      ) {
        return;
      }

      setLoading(true);
      const base64String = await convertFileToBase64(logoImage);

      try {
        await authenticatedAxios.post<TenantLogoUpdateDTO>(
          `/tenant/${encodeURIComponent(tenantId)}/updateLogo`,
          { imageAsBase64: base64String }
        );
      } catch (error) {
        setLoading(false);
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Failed to upload image, unknown reason';
        console.error(errorMessage, error);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
      setLoading(false);
      enqueueSnackbar('Updated company logo', { variant: 'success' });
    };
    await uploadImage();
    onUploadSuccess?.();
  }, [
    authenticatedAxios,
    enqueueSnackbar,
    logoImage,
    onUploadSuccess,
    tenantId,
  ]);

  return (
    <Dialog open={showDialog} onClose={toggleShowDialog} className="m-auto">
      <div className="px-3">
        <DialogTitle
          id="alert-dialog-title"
          className="text-center font-bold mb-4"
        >
          <br />
          {'Change company logo (white-label)'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="text-md text-left"
          >
            To replace the logo of caralegal with the customer&apos;s own
            company logo:
            <br />
            <ul className="list-disc px-5 space-y-2 mt-2">
              <li>
                Please select a <b>png</b> file to upload.
              </li>
              <li>Please make sure that the image has a square format.</li>
              <li>
                Please make sure that the image size does not exceed 10 MB.
              </li>
              <li>
                Please note that after uploading the change is immediately
                visible to users.
              </li>
            </ul>
          </DialogContentText>
          {logoImage && displayLogo && (
            <div className="my-6 flex items-center">
              <div className="w-16 h-16 relative mr-8 ">
                <Image
                  src={displayLogo}
                  alt="company logo"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>

              <p className="text-md font-semibold text-gray-800">
                {logoImage?.name}
              </p>
            </div>
          )}

          <div className="flex space-x-6 items-center mt-6 justify-center">
            <Button
              variant="outlined"
              component="label"
              className="min-w-[8rem] h-12 whitespace-nowrap"
            >
              Select File
              <input
                type="file"
                onChange={handleSelectFile}
                hidden
                accept="image/png"
              />
            </Button>
            <div className="flex justify-end">
              <Button
                variant="contained"
                onClick={handleUploadImage}
                className="my-2 h-12 min-w-[8rem] hover:bg-opacity-5 relative bottom-0 right-0"
                fullWidth
                disabled={!logoImage || loading}
              >
                Upload
              </Button>{' '}
            </div>{' '}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
