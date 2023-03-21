import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, CircularProgress, TextField } from '@mui/material';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

export default function CustomDialog({
  showDialog,
  handleCloseDialog,
  primaryButtonOnClick,
  loading,
  confirmationText,
  customWarningText,
}: {
  showDialog: boolean;
  handleCloseDialog?: () => void;
  primaryButtonOnClick: () => void;
  loading: boolean;
  confirmationText?: string;
  customWarningText?: JSX.Element;
}) {
  const [userConfirmationText, setUserConfirmationText] = useState('');
  const onUserConfirmationTextChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUserConfirmationText(event.target.value);
    },
    []
  );

  const [primaryButtonEnabled, setPrimaryButtonEnabled] = useState(true);
  useEffect(() => {
    if (!confirmationText) {
      setPrimaryButtonEnabled(true);
      return;
    }

    setPrimaryButtonEnabled(confirmationText.trim() === userConfirmationText);
  }, [confirmationText, userConfirmationText]);

  const onPrimaryButtonClickedCallback = useCallback(() => {
    if (primaryButtonEnabled) {
      setUserConfirmationText('');
      return primaryButtonOnClick();
    }
  }, [primaryButtonEnabled, primaryButtonOnClick]);

  const closeDialog = useCallback(() => {
    if (handleCloseDialog) {
      handleCloseDialog();
    }

    setUserConfirmationText('');
  }, [handleCloseDialog]);

  return (
    <Dialog
      open={showDialog}
      onClose={closeDialog}
      className="m-auto max-w-lg text-center"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className="text-center">
        <HighlightOffIcon className="text-red-500 text-[8rem]" />
        <br />
        {'Are you sure?'}
      </DialogTitle>
      {confirmationText && (
        <DialogContent>
          <DialogContentText id="alert-dialog-description" className="text-md">
            <>
              {!customWarningText && (
                <>
                  This action <b>cannot</b> be undone. This will permanently
                  delete the tenant:
                  <p className="relative whitespace-pre text-lg text-white bg-red-500 bg-opacity-95 shadow-lg my-3 rounded-md py-2 px-3">
                    {confirmationText}
                  </p>
                  Please type in{' '}
                  <b className="whitespace-pre">{confirmationText}</b> to
                  confirm.
                </>
              )}
              {customWarningText}
              <TextField
                id="confirmation"
                variant="outlined"
                type="text"
                required
                fullWidth
                autoFocus
                size="small"
                margin="normal"
                value={userConfirmationText}
                inputProps={{ style: { textAlign: 'center' } }}
                onChange={onUserConfirmationTextChanged}
              />
            </>
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions className="flex items-center justify-center mb-3 space-x-6">
        <Button
          onClick={closeDialog}
          className="text-gray-500 bg-white hover:bg-slate-50"
          variant="contained"
        >
          Cancel
        </Button>

        <Button
          onClick={onPrimaryButtonClickedCallback}
          autoFocus
          variant="contained"
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-red-300 disabled:border-solid disabled:border-gray-300 disabled:border disabled:text-opacity-60"
          disabled={loading || !primaryButtonEnabled}
        >
          {loading && <CircularProgress size={'1.5rem'} className="mr-2" />}
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
