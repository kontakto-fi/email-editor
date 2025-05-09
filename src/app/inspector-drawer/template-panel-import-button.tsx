import React, { useState } from 'react';
import { FileUploadOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import ImportJsonDialog from '../email-canvas/import-json/import-json-dialog';

export default function TemplateImportButton() {
  const [open, setOpen] = useState(false);
  
  const handleClose = () => {
    setOpen(false);
    return true; // Explicitly return boolean to satisfy type requirement
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<FileUploadOutlined />}
        onClick={() => setOpen(true)}
        fullWidth
      >
        Import JSON
      </Button>
      
      {open && <ImportJsonDialog onClose={handleClose} />}
    </>
  );
} 