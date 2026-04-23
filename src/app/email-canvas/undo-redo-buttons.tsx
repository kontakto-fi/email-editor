import React, { useEffect } from 'react';

import { RedoOutlined, UndoOutlined } from '@mui/icons-material';
import { IconButton, Stack, Tooltip } from '@mui/material';

import { redo, undo, useCanRedo, useCanUndo } from '@editor/editor-context';
import { t } from '@i18n';

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator.platform || '').toLowerCase();
  if (platform.includes('mac')) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  return ua.includes('mac') && !ua.includes('windows');
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function UndoRedoButtons() {
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const mac = isMac();
  const modKey = mac ? '⌘' : 'Ctrl';
  const undoHint = `${modKey}+Z`;
  const redoHint = mac ? `${modKey}+⇧+Z` : `${modKey}+Shift+Z / ${modKey}+Y`;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = mac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      // Defer to the native undo stack when focus is inside a text field —
      // the user expects Cmd+Z to rewind the field they're typing in.
      if (isEditableTarget(e.target)) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || (key === 'y' && !mac)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mac]);

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title={`${t('undo.tooltip', 'Undo')} (${undoHint})`}>
        <span>
          <IconButton
            size="small"
            onClick={undo}
            disabled={!canUndo}
            aria-label={t('undo.label', 'Undo')}
          >
            <UndoOutlined fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={`${t('redo.tooltip', 'Redo')} (${redoHint})`}>
        <span>
          <IconButton
            size="small"
            onClick={redo}
            disabled={!canRedo}
            aria-label={t('redo.label', 'Redo')}
          >
            <RedoOutlined fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
