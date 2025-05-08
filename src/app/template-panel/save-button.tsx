import React from 'react';

import { SaveOutlined } from '@mui/icons-material';
import { IconButton, Snackbar, Tooltip } from '@mui/material';

import { useEmailEditor } from '../context';

export default function SaveButton() {
  const { saveTemplate } = useEmailEditor();
  const [message, setMessage] = React.useState<string | null>(null);

  const onClick = async () => {
    try {
      // Use the saveTemplate function from the EmailEditorContext
      const savedTemplate = saveTemplate();
      
      // Set success message
      setMessage('Template saved successfully!');
    } catch (error) {
      // Handle any errors
      console.error('Error saving template:', error);
      setMessage('Error saving template');
    }
  };

  const onClose = () => {
    setMessage(null);
  };

  return (
    <>
      <IconButton onClick={onClick}>
        <Tooltip title="Save template">
          <SaveOutlined fontSize="small" />
        </Tooltip>
      </IconButton>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={message !== null}
        onClose={onClose}
        message={message}
        autoHideDuration={3000}
      />
    </>
  );
} 