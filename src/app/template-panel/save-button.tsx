import React from 'react';

import { SaveOutlined } from '@mui/icons-material';
import { IconButton, Snackbar, Tooltip } from '@mui/material';

import { useDocument } from '@editor/editor-context';

export default function SaveButton() {
  const document = useDocument();
  const [message, setMessage] = React.useState<string | null>(null);

  const onClick = async () => {
    // Here you would normally implement the save functionality
    // For now, we'll just show a message
    
    // Example of how you might handle the save action:
    // const templateData = JSON.stringify(document);
    // await saveTemplateToServer(templateData);
    
    setMessage('Template saved successfully!');
    
    // You can also trigger any save callback passed from parent components
    // if (onSave) onSave(document);
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