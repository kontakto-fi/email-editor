import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { t } from '@i18n';

// Known panel titles — translated by looking up a derived i18n key so each
// panel file doesn't have to import the i18n helper itself.
const TITLE_KEYS: Record<string, string> = {
  'Editor appearance': 'panel.editor-appearance',
  Template: 'panel.template',
  Export: 'panel.export',
  Global: 'panel.global',
  'Text block': 'panel.text-block',
  'Heading block': 'panel.heading-block',
  'Button block': 'panel.button-block',
  'Image block': 'panel.image-block',
  'Avatar block': 'panel.avatar-block',
  'Signature block': 'panel.signature-block',
  'Spacer block': 'panel.spacer-block',
  'Divider block': 'panel.divider-block',
  'Columns block': 'panel.columns-block',
  'Container block': 'panel.container-block',
  'Html block': 'panel.html-block',
  Details: 'panel.details',
};

type SidebarPanelProps = {
  title: string;
  children: React.ReactNode;
};
export default function BaseSidebarPanel({ title, children }: SidebarPanelProps) {
  const key = TITLE_KEYS[title];
  const displayTitle = key ? t(key, title) : title;
  return (
    <Box p={2}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {displayTitle}
      </Typography>
      <Stack spacing={5} mb={3}>
        {children}
      </Stack>
    </Box>
  );
}
