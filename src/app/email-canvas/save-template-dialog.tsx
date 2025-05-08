import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box
} from '@mui/material';

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (templateName: string) => void;
  defaultName?: string;
}

export default function SaveTemplateDialog({ 
  open, 
  onClose, 
  onSave,
  defaultName = ''
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState(defaultName);
  const [error, setError] = useState('');
  
  // Reset name when dialog opens with the default name
  useEffect(() => {
    if (open) {
      setTemplateName(defaultName);
      setError('');
    }
  }, [open, defaultName]);

  const handleSave = () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }
    
    onSave(templateName);
    setTemplateName('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setTemplateName('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Save Email Template</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="template-name"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              if (e.target.value.trim()) {
                setError('');
              }
            }}
            error={!!error}
            helperText={error}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && templateName.trim()) {
                handleSave();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!templateName.trim()}
        >
          Save Template
        </Button>
      </DialogActions>
    </Dialog>
  );
} 