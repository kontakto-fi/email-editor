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
  onSave: (templateName: string) => Promise<boolean> | boolean | void;
  onNameChange?: () => void;
  defaultName?: string;
  error?: string | null;
}

export default function SaveTemplateDialog({ 
  open, 
  onClose, 
  onSave,
  onNameChange,
  defaultName = '',
  error: externalError = null
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState(defaultName);
  const [internalError, setInternalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset name when dialog opens with the default name
  useEffect(() => {
    if (open) {
      setTemplateName(defaultName);
      setInternalError('');
      setIsSubmitting(false);
    }
  }, [open, defaultName]);

  // Determine which error to display - external has priority
  const displayError = externalError || internalError;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
    
    if (e.target.value.trim()) {
      setInternalError('');
    }
    
    // Notify parent component that name has changed
    if (onNameChange) {
      onNameChange();
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setInternalError('Please enter a template name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call onSave and wait for result if it's a Promise
      const result = onSave(templateName);
      
      // Handle promise or boolean result
      if (result instanceof Promise) {
        const success = await result;
        if (success) {
          setTemplateName('');
          setInternalError('');
          onClose();
        }
      } else if (result !== false) {
        // If not explicitly false, assume success
        setTemplateName('');
        setInternalError('');
        onClose();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTemplateName('');
    setInternalError('');
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
            onChange={handleNameChange}
            error={!!displayError}
            helperText={displayError}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && templateName.trim() && !displayError && !isSubmitting) {
                handleSave();
              }
            }}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!templateName.trim() || !!displayError || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 