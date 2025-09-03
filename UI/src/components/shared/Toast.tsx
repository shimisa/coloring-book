import React from 'react';
import { Snackbar, Alert, AlertColor, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ToastProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 4000,
}) => {
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // Only close on timeout, not on clickaway
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  const handleCloseClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseClick}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          fontSize: '1rem',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
          '& .MuiAlert-action': {
            padding: '4px',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;