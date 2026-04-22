import React from 'react';
import { Box, InputBase } from '@mui/material';
import { setDocument, setLastFocusedEditable, useDocument } from '@editor/editor-context';
import type { EmailLayoutProps } from '@editor/blocks/email-layout/email-layout-props-schema';

export default function SubjectInput() {
  const document = useDocument();
  const root = document.root;
  if (!root || root.type !== 'EmailLayout') return null;
  const data = root.data as EmailLayoutProps;
  const subject = data.subject ?? '';

  const handleChange = (value: string) => {
    setDocument({
      root: { ...root, data: { ...data, subject: value } },
    });
  };

  const trackFocus = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement | null;
    if (!target || typeof target.value !== 'string') return;
    setLastFocusedEditable({
      blockId: 'subject',
      field: 'subject',
      selectionStart: target.selectionStart ?? target.value.length,
      selectionEnd: target.selectionEnd ?? target.value.length,
    });
  };

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
      <Box sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 600, minWidth: 56 }}>Subject</Box>
      <InputBase
        fullWidth
        placeholder="Email subject — supports {{variables}}"
        value={subject}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={trackFocus}
        onSelect={trackFocus}
        onKeyUp={trackFocus}
        onClick={trackFocus}
        sx={{ fontSize: 14 }}
      />
    </Box>
  );
}
