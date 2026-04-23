import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

export interface RenameDialogProps {
  open: boolean;
  currentSlug: string;
  currentTags?: string[];
  existingSlugs: string[];
  onClose: () => void;
  onSubmit: (newSlug: string, opts?: { tags?: string[] }) => void | Promise<void>;
}

export default function RenameDialog({
  open,
  currentSlug,
  currentTags = [],
  existingSlugs,
  onClose,
  onSubmit,
}: RenameDialogProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [tags, setTags] = useState<string[]>(currentTags);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSlug(currentSlug);
      setTags(currentTags);
      setTagInput('');
      setError(null);
      setSubmitting(false);
    }
  }, [open, currentSlug, currentTags]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTagInput('');
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const tagsUnchanged =
    tags.length === currentTags.length &&
    tags.every((t, i) => t === currentTags[i]);

  const handleSubmit = async () => {
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      setError('Please enter a name');
      return;
    }
    const slugChanged = trimmedSlug !== currentSlug;
    if (slugChanged && existingSlugs.some((s) => s.toLowerCase() === trimmedSlug.toLowerCase())) {
      setError('A template with this name already exists');
      return;
    }
    if (!slugChanged && tagsUnchanged) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmedSlug, { tags });
      onClose();
    } catch (e) {
      console.error('Error updating template details:', e);
      setError('Failed to update template details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit details</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          variant="outlined"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setError(null);
          }}
          error={!!error}
          helperText={error ?? ' '}
          disabled={submitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !submitting) handleSubmit();
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, mb: 0.5 }}>
          Tags
        </Typography>
        {tags.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={submitting ? undefined : () => removeTag(tag)}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
            No tags yet. Suggested: <i>transactional</i>, <i>marketing</i>.
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          placeholder="Add a tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          disabled={submitting}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
              e.preventDefault();
              removeTag(tags[tags.length - 1]);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={addTag}
                  disabled={!tagInput.trim() || submitting}
                  startIcon={<AddOutlined fontSize="small" />}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ minHeight: 8 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!slug.trim() || submitting}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
