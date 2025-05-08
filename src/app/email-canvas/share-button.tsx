import React from 'react';

import { IosShareOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useDocument } from '@editor/editor-context';
import { useSnackbar } from './snackbar-provider';

export default function ShareButton() {
  const document = useDocument();
  const { showMessage } = useSnackbar();

  const onClick = async () => {
    const c = encodeURIComponent(JSON.stringify(document));
    location.hash = `#code/${btoa(c)}`;
    showMessage('The URL was updated. Copy it to share your current template.');
  };

  return (
    <IconButton onClick={onClick}>
      <Tooltip title="Share current template">
        <IosShareOutlined fontSize="small" />
      </Tooltip>
    </IconButton>
  );
}
