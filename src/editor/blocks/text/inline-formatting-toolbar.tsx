import React, { useEffect, useRef, useState } from 'react';

import { FormatBoldOutlined, FormatItalicOutlined, LinkOutlined } from '@mui/icons-material';
import { IconButton, Paper, Popper, Stack, TextField } from '@mui/material';

import { t } from '@i18n';

type Props = {
  anchorEl: HTMLElement | null;
  visible: boolean;
  linkPrompt: boolean;
  onBold: () => void;
  onItalic: () => void;
  onLinkRequest: () => void;
  onLinkSubmit: (url: string) => void;
  onLinkCancel: () => void;
};

export default function InlineFormattingToolbar({
  anchorEl,
  visible,
  linkPrompt,
  onBold,
  onItalic,
  onLinkRequest,
  onLinkSubmit,
  onLinkCancel,
}: Props) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (linkPrompt) {
      setUrl('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [linkPrompt]);

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <Popper open={visible} anchorEl={anchorEl} placement="top-start" style={{ zIndex: 1300 }}>
      <Paper elevation={4} sx={{ px: 0.5, py: 0.25, mb: 0.5 }} onMouseDown={preventBlur}>
        {linkPrompt ? (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
            <TextField
              inputRef={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              variant="standard"
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmed = url.trim();
                  if (trimmed) onLinkSubmit(trimmed);
                  else onLinkCancel();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onLinkCancel();
                }
              }}
              sx={{ width: 220 }}
            />
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.25}>
            <IconButton size="small" onClick={onBold} title={t('toolbar.bold-shortcut', 'Bold (Cmd+B)')} aria-label={t('toolbar.bold', 'Bold')}>
              <FormatBoldOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onItalic} title={t('toolbar.italic-shortcut', 'Italic (Cmd+I)')} aria-label={t('toolbar.italic', 'Italic')}>
              <FormatItalicOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onLinkRequest} title={t('toolbar.link-shortcut', 'Link (Cmd+K)')} aria-label={t('toolbar.link', 'Link')}>
              <LinkOutlined fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Paper>
    </Popper>
  );
}
