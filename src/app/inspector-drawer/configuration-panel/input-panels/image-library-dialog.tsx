import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline, SearchOutlined } from '@mui/icons-material';
import { useImageCallbacks, type LibraryImage } from '../../../image-context';

type ImageLibraryDialogProps = {
  open: boolean;
  onClose: () => void;
  onPick: (image: LibraryImage) => void;
};

export default function ImageLibraryDialog({ open, onClose, onPick }: ImageLibraryDialogProps) {
  const { loadImages, deleteImage } = useImageCallbacks();
  const [images, setImages] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!loadImages) return;
    setBusy(true);
    setError(null);
    try {
      const list = await loadImages();
      setImages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load images');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (open) {
      setQuery('');
      void refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    if (!images) return null;
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter((img) => {
      const haystack = `${img.alt ?? ''} ${img.url}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [images, query]);

  const handleDelete = async (url: string) => {
    if (!deleteImage) return;
    const ok = window.confirm('Delete this image from the library?');
    if (!ok) return;
    setBusy(true);
    try {
      await deleteImage(url);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete image');
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Image library</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by alt text or URL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {busy && !images && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {filtered && filtered.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            {query ? 'No images match your search.' : 'No images in the library yet.'}
          </Typography>
        )}

        {filtered && filtered.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1.5,
            }}
          >
            {filtered.map((img) => (
              <ImageTile
                key={img.url}
                image={img}
                onPick={() => onPick(img)}
                onDelete={deleteImage ? () => handleDelete(img.url) : undefined}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function ImageTile({
  image,
  onPick,
  onDelete,
}: {
  image: LibraryImage;
  onPick: () => void;
  onDelete?: () => void;
}) {
  const src = image.thumbnailUrl ?? image.url;
  const label = image.alt || image.url.split('/').pop() || 'image';
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 120ms',
        '&:hover': { borderColor: 'primary.main' },
        '&:hover .delete-btn': { opacity: 1 },
      }}
      onClick={onPick}
    >
      <Box
        component="img"
        src={src}
        alt={image.alt ?? ''}
        sx={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', backgroundColor: '#f5f5f5' }}
      />
      <Box sx={{ p: 0.75, fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Box>
      {onDelete && (
        <Tooltip title="Delete from library">
          <IconButton
            size="small"
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              opacity: 0,
              backgroundColor: 'rgba(255,255,255,0.85)',
              transition: 'opacity 120ms',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
            }}
            aria-label="Delete image"
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
