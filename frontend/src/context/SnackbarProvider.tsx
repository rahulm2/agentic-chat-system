import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';
import { borderSemantics } from '../design-system';

interface SnackbarMessage {
  key: number;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [, setQueue] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);

  const processQueue = useCallback(() => {
    setQueue((prev) => {
      if (prev.length > 0) {
        setCurrent(prev[0]!);
        setOpen(true);
        return prev.slice(1);
      }
      return prev;
    });
  }, []);

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = 'info') => {
      const newMessage: SnackbarMessage = { key: Date.now(), message, severity };

      if (open) {
        setQueue((prev) => [...prev, newMessage]);
      } else {
        setCurrent(newMessage);
        setOpen(true);
      }
    },
    [open]
  );

  const showError = useCallback(
    (message: string) => showSnackbar(message, 'error'),
    [showSnackbar]
  );

  const showSuccess = useCallback(
    (message: string) => showSnackbar(message, 'success'),
    [showSnackbar]
  );

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setOpen(false);
    },
    []
  );

  const handleExited = useCallback(() => {
    setCurrent(null);
    processQueue();
  }, [processQueue]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, showError, showSuccess }}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionProps={{ onExited: handleExited }}
      >
        {current ? (
          <Alert
            onClose={handleClose}
            severity={current.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: `${borderSemantics.radius.card}px` }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
