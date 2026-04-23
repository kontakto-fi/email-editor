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

import { t } from '@i18n';

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
      setError(t('rename.error-empty', 'Please enter a name'));
      return;
    }
    const slugChanged = trimmedSlug !== currentSlug;
    if (slugChanged && existingSlugs.some((s) => s.toLowerCase() === trimmedSlug.toLowerCase())) {
      setError(t('rename.error-taken', 'A template with this name already exists'));
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
      setError(t('rename.error-generic', 'Failed to update template details'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('rename.title', 'Edit details')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('rename.name-label', 'Name')}
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
          {t('rename.tags', 'Tags')}
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
            {t('rename.no-tags', 'No tags yet.')}
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          placeholder={t('rename.tag-placeholder', 'Add a tag and press Enter')}
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
                  {t('common.add', 'Add')}
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ minHeight: 8 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!slug.trim() || submitting}
        >
          {submitting ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
