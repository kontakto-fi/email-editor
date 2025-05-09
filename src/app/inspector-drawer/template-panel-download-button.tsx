import React, { useMemo } from 'react';
import { FileDownloadOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useDocument } from '@editor/editor-context';

export default function TemplateDownloadButton() {
  const doc = useDocument();
  const href = useMemo(() => {
    return `data:text/plain,${encodeURIComponent(JSON.stringify(doc, null, '  '))}`;
  }, [doc]);

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<FileDownloadOutlined />}
      href={href}
      download="emailTemplate.json"
      fullWidth
    >
      Download JSON
    </Button>
  );
} 