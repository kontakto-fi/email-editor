import React, { createContext, useContext, useState } from 'react';
import { Snackbar } from '@mui/material';

// Define the context
interface SnackbarContextType {
  showMessage: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

// Custom hook to use the snackbar
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

// Snackbar Provider component
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(3000);

  const showMessage = (text: string, customDuration = 3000) => {
    setMessage(text);
    setDuration(customDuration);
  };

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={message !== null}
        onClose={handleClose}
        message={message}
        autoHideDuration={duration}
        sx={{
          zIndex: 10000, // Very high z-index
          position: 'fixed', // Make sure it's fixed positioned
        }}
      />
    </SnackbarContext.Provider>
  );
} 