import React from 'react';

import { Box, Divider, Menu, Typography } from '@mui/material';
import { WidgetsOutlined } from '@mui/icons-material';

import { TEditorBlock } from '@editor/core';
import { setDocument } from '@editor/editor-context';
import { rekeyBlocks } from '@editor/blocks/helpers/block-utils';
import { useEditorConfig, type CustomBlock } from '../../../../../app/editor-config-context';
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
  const { customBlocks } = useEditorConfig();

  const onClose = () => {
    setAnchorEl(null);
  };

  const onClick = (block: TEditorBlock) => {
    onSelect(block);
    setAnchorEl(null);
  };

  const onCustomBlockClick = (customBlock: CustomBlock) => {
    const { blocks: rekeyed, newRootId } = rekeyBlocks(customBlock.blocks, customBlock.rootBlockId);
    const rootBlock = rekeyed[newRootId];
    // Add all non-root blocks to the document first
    const extraBlocks: Record<string, any> = {};
    for (const [id, block] of Object.entries(rekeyed)) {
      if (id !== newRootId) {
        extraBlocks[id] = block;
      }
    }
    if (Object.keys(extraBlocks).length > 0) {
      setDocument(extraBlocks);
    }
    // Insert the root block via the normal insertion flow
    onSelect(rootBlock);
    setAnchorEl(null);
  };

  if (anchorEl === null) {
    return null;
  }

  const hasCustomBlocks = customBlocks && customBlocks.length > 0;

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
      {hasCustomBlocks && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary' }}>
            {t('block-add.custom-blocks', 'Custom blocks')}
          </Typography>
          <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            {customBlocks.map((cb, i) => (
              <BlockButton
                key={`custom-${i}`}
                label={cb.label}
                icon={cb.icon ?? <WidgetsOutlined />}
                onClick={() => onCustomBlockClick(cb)}
              />
            ))}
          </Box>
        </>
      )}
    </Menu>
  );
}
