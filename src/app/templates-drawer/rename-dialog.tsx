import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export interface RenameDialogProps {
  open: boolean;
  currentSlug: string;
  existingSlugs: string[];
  onClose: () => void;
  onSubmit: (newSlug: string) => void | Promise<void>;
}

export default function RenameDialog({
  open,
  currentSlug,
  existingSlugs,
  onClose,
  onSubmit,
}: RenameDialogProps) {
  const [value, setValue] = useState(currentSlug);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(currentSlug);
      setError(null);
      setSubmitting(false);
    }
  }, [open, currentSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (trimmed === currentSlug) {
      onClose();
      return;
    }
    if (existingSlugs.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError('A template with this name already exists');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (e) {
      console.error('Error renaming template:', e);
      setError('Failed to rename template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rename template</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Slug"
          fullWidth
          variant="outlined"
          value={value}
          onChange={handleChange}
          error={!!error}
          helperText={error}
          disabled={submitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !submitting) {
              handleSubmit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!value.trim() || submitting}
        >
          {submitting ? 'Renaming...' : 'Rename'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
