import React from 'react';
import ReactDOM from 'react-dom/client';

import { CssBaseline, ThemeProvider } from '@mui/material';

import EmailEditor from './app';
import { TEditorConfiguration } from '@editor/core';
import theme from './theme';

// Wrapper component to listen to template changes
const EmailEditorWrapper = () => {
  const handleTemplateSave = (template: TEditorConfiguration) => {
    console.log('Saved template:', template);
  };

  return <EmailEditor onSave={handleTemplateSave} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EmailEditorWrapper />
    </ThemeProvider>
  </React.StrictMode>
);
