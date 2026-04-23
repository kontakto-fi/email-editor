import React from 'react';

import { Box, Menu } from '@mui/material';

import { TEditorBlock } from '@editor/core';
import { t } from '@i18n';

import BlockButton from './block-button';
import { BUTTONS } from './buttons';

const LABEL_KEYS: Record<string, string> = {
  Heading: 'block-add.heading',
  Text: 'block-add.text',
  Button: 'block-add.button',
  Image: 'block-add.image',
  Avatar: 'block-add.avatar',
  'Personal Signature': 'block-add.personal-signature',
  'Company Signature': 'block-add.company-signature',
  Divider: 'block-add.divider',
  Spacer: 'block-add.spacer',
  Html: 'block-add.html',
  Columns: 'block-add.columns',
  Container: 'block-add.container',
};

type BlocksMenuProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (v: HTMLElement | null) => void;
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ anchorEl, setAnchorEl, onSelect }: BlocksMenuProps) {
  const onClose = () => {
    setAnchorEl(null);
  };

  const onClick = (block: TEditorBlock) => {
    onSelect(block);
    setAnchorEl(null);
  };

  if (anchorEl === null) {
    return null;
  }

  return (
    <Menu
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        {BUTTONS.map((k, i) => (
          <BlockButton
            key={i}
            label={LABEL_KEYS[k.label] ? t(LABEL_KEYS[k.label], k.label) : k.label}
            icon={k.icon}
            onClick={() => onClick(k.block())}
          />
        ))}
      </Box>
    </Menu>
  );
}
