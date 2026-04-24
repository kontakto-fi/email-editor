import React from 'react';
import { Box } from '@mui/material';
import { useDocument } from '@editor/editor-context';
import type { EmailLayoutProps } from '@editor/blocks/email-layout/email-layout-props-schema';
import { t } from '@i18n';
import {
  buildSampleValueMap,
  substituteSampleValues,
  TemplateVariable,
} from '../variables/variable-utils';

export default function SubjectPreview() {
  const document = useDocument();
  const root = document.root;
  if (!root || root.type !== 'EmailLayout') return null;
  const data = root.data as EmailLayoutProps;
  const subject = data.subject ?? '';
  if (!subject) return null;

  const samples = buildSampleValueMap((data.variables ?? []) as TemplateVariable[]);
  const rendered = substituteSampleValues(subject, samples);

  return (
    <Box
      sx={{
        px: 3,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'white',
        position: 'sticky',
        top: 49,
        zIndex: 'appBar',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 600, minWidth: 56 }}>
        {t('subject.label', 'Subject')}
      </Box>
      <Box sx={{ fontSize: 14 }}>{rendered}</Box>
    </Box>
  );
}
