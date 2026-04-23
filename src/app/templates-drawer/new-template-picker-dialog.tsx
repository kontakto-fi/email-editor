import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { DescriptionOutlined, InsertDriveFileOutlined } from '@mui/icons-material';
import { t } from '@i18n';
import { TemplateListItem } from '../index';

type NewTemplatePickerDialogProps = {
  open: boolean;
  kind: 'template' | 'sample';
  samples: TemplateListItem[];
  existingSlugs: string[];
  defaultName?: string;
  onClose: () => void;
  /** Returns `true` on success so the dialog closes, `false` to keep it open (e.g. for server-side validation errors). */
  onCreate: (name: string, starterId: string | null) => Promise<boolean>;
};

export default function NewTemplatePickerDialog({
  open,
  kind,
  samples,
  existingSlugs,
  defaultName,
  onClose,
  onCreate,
}: NewTemplatePickerDialogProps) {
  const [name, setName] = useState('');
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName ?? t(kind === 'sample' ? 'drawer.new-sample' : 'drawer.new-template', kind === 'sample' ? 'New sample' : 'New template'));
      setSelectedStarter(null);
      setError(null);
      setBusy(false);
    }
  }, [open, defaultName, kind]);

  const validate = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return t('picker.error-name-required', 'Name is required');
    if (existingSlugs.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return kind === 'sample'
        ? t('picker.error-sample-taken', 'A sample with this name already exists')
        : t('picker.error-template-taken', 'A template with this name already exists');
    }
    return null;
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    try {
      const ok = await onCreate(name.trim(), selectedStarter);
      if (ok) onClose();
    } finally {
      setBusy(false);
    }
  };

  const pickable = samples.filter((s) => s.id !== 'empty-email');

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {kind === 'sample'
          ? t('picker.title-sample', 'New sample')
          : t('picker.title-template', 'New template')}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('picker.start-from', 'Start from')}
        </Typography>
        <List
          dense
          sx={{
            mb: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            py: 0,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          <ListItemButton
            selected={selectedStarter === null}
            onClick={() => setSelectedStarter(null)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <InsertDriveFileOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
              <ListItemText primary={t('picker.blank-title', 'Blank')} secondary={t('picker.blank-desc', 'Start from an empty email')} />
            </Box>
          </ListItemButton>
          {pickable.map((s) => (
            <ListItemButton
              key={s.id}
              selected={selectedStarter === s.id}
              onClick={() => setSelectedStarter(s.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <DescriptionOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                <ListItemText primary={s.slug} secondary={s.description} />
              </Box>
            </ListItemButton>
          ))}
        </List>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label={t('rename.name-label', 'Name')}
          value={name}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !busy) void handleCreate();
          }}
          error={Boolean(error)}
          helperText={error ?? ' '}
          disabled={busy}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={busy}>
          {busy
            ? t('picker.creating', 'Creating…')
            : kind === 'sample'
              ? t('picker.create-sample', 'Create sample')
              : t('picker.create-template', 'Create template')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
