import React, { useEffect, useRef, useState } from 'react';

import {
  FormatBoldOutlined,
  FormatColorTextOutlined,
  FormatItalicOutlined,
  FormatOverlineOutlined,
  FormatUnderlinedOutlined,
  LinkOutlined,
  TextFieldsOutlined,
} from '@mui/icons-material';
import { IconButton, MenuItem, Paper, Popper, Select, Stack, TextField } from '@mui/material';

import { t } from '@i18n';

import type { MarkdownToolbarPrompt } from '../helpers/use-markdown-toolbar';

type Props = {
  anchorEl: HTMLElement | null;
  visible: boolean;
  activePrompt: MarkdownToolbarPrompt;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onOverline: () => void;
  onLinkRequest: () => void;
  onLinkSubmit: (url: string) => void;
  onColorRequest: () => void;
  onColorSubmit: (color: string) => void;
  onFontRequest: () => void;
  onFontSubmit: (fontFamily: string) => void;
  onPromptCancel: () => void;
};

// Stack aligned with the sidebar font-family options. Values are the CSS
// font-family strings emitted for each choice; labels are shown to the user.
const FONT_OPTIONS: Array<{ label: string; value: string }> = [
  {
    label: 'Modern sans',
    value: '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif',
  },
  {
    label: 'Book sans',
    value: 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif',
  },
  {
    label: 'Organic sans',
    value: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif',
  },
  {
    label: 'Geometric sans',
    value: 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif',
  },
  {
    label: 'Modern serif',
    value: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
  },
  {
    label: 'Book serif',
    value: '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif',
  },
  {
    label: 'Monospace',
    value: '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace',
  },
];

export default function InlineFormattingToolbar({
  anchorEl,
  visible,
  activePrompt,
  onBold,
  onItalic,
  onUnderline,
  onOverline,
  onLinkRequest,
  onLinkSubmit,
  onColorRequest,
  onColorSubmit,
  onFontRequest,
  onFontSubmit,
  onPromptCancel,
}: Props) {
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('#000000');
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activePrompt === 'link') {
      setUrl('');
      setTimeout(() => urlRef.current?.focus(), 0);
    } else if (activePrompt === 'color') {
      setColor('#000000');
    } else if (activePrompt === 'font') {
      setFont(FONT_OPTIONS[0].value);
    }
  }, [activePrompt]);

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <Popper open={visible} anchorEl={anchorEl} placement="top-start" style={{ zIndex: 1300 }}>
      <Paper elevation={4} sx={{ px: 0.5, py: 0.25, mb: 0.5 }} onMouseDown={preventBlur}>
        {activePrompt === 'link' ? (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
            <TextField
              inputRef={urlRef}
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
                  else onPromptCancel();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onPromptCancel();
                }
              }}
              sx={{ width: 220 }}
            />
          </Stack>
        ) : activePrompt === 'color' ? (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5, py: 0.25 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 40, height: 28, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}
            />
            <IconButton size="small" onClick={() => onColorSubmit(color)} title={t('toolbar.apply', 'Apply')}>
              <FormatColorTextOutlined fontSize="small" />
            </IconButton>
          </Stack>
        ) : activePrompt === 'font' ? (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5, py: 0.25 }}>
            <Select
              value={font}
              onChange={(e) => setFont(e.target.value as string)}
              size="small"
              variant="standard"
              sx={{ minWidth: 180, fontSize: 13 }}
            >
              {FONT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: opt.value }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            <IconButton size="small" onClick={() => onFontSubmit(font)} title={t('toolbar.apply', 'Apply')}>
              <TextFieldsOutlined fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.25}>
            <IconButton size="small" onClick={onBold} title={t('toolbar.bold-shortcut', 'Bold (Cmd+B)')} aria-label={t('toolbar.bold', 'Bold')}>
              <FormatBoldOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onItalic} title={t('toolbar.italic-shortcut', 'Italic (Cmd+I)')} aria-label={t('toolbar.italic', 'Italic')}>
              <FormatItalicOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onUnderline} title={t('toolbar.underline-shortcut', 'Underline (Cmd+U)')} aria-label={t('toolbar.underline', 'Underline')}>
              <FormatUnderlinedOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onOverline} title={t('toolbar.overline', 'Overline')} aria-label={t('toolbar.overline', 'Overline')}>
              <FormatOverlineOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onColorRequest} title={t('toolbar.text-color', 'Text color')} aria-label={t('toolbar.text-color', 'Text color')}>
              <FormatColorTextOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onFontRequest} title={t('toolbar.font-family', 'Font family')} aria-label={t('toolbar.font-family', 'Font family')}>
              <TextFieldsOutlined fontSize="small" />
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
