import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';

import App from '../app';
import theme from '../theme';
import { TEditorConfiguration } from '@editor/core';
import { useDocument, resetDocument } from '@editor/editor-context';
import { EmailEditorProvider, useEmailEditor } from './context';

// The ref interface for imperative controls
export interface EmailEditorRef {
  saveTemplate: () => TEditorConfiguration;
  loadTemplate: (template: TEditorConfiguration) => void;
  getTemplate: () => TEditorConfiguration;
}

// Props for the EmailEditor component
export interface EmailEditorProps {
  initialTemplate?: TEditorConfiguration;
  onSave?: (template: TEditorConfiguration) => void;
  onChange?: (template: TEditorConfiguration) => void;
}

// Internal component that connects the App with the EmailEditor context
const EmailEditorInternal = forwardRef<EmailEditorRef, {}>((_props, ref) => {
  const { template, updateTemplate, saveTemplate, loadTemplate } = useEmailEditor();
  const currentDocument = useDocument();

  // Sync the document state with our context
  useEffect(() => {
    if (JSON.stringify(currentDocument) !== JSON.stringify(template)) {
      updateTemplate(currentDocument);
    }
  }, [currentDocument, template, updateTemplate]);

  // Expose the API via ref
  useImperativeHandle(ref, () => ({
    saveTemplate: () => {
      return saveTemplate();
    },
    loadTemplate: (newTemplate) => {
      loadTemplate(newTemplate);
      resetDocument(newTemplate);
    },
    getTemplate: () => {
      return template;
    }
  }));

  return <App />;
});

// The main EmailEditor component that external apps will use
const EmailEditor = forwardRef<EmailEditorRef, EmailEditorProps>((props, ref) => {
  const { initialTemplate, onSave, onChange } = props;

  // Initialize with the provided template
  useEffect(() => {
    if (initialTemplate) {
      resetDocument(initialTemplate);
    }
  }, [initialTemplate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EmailEditorProvider 
        initialTemplate={initialTemplate}
        onSave={onSave}
        onChange={onChange}
      >
        <EmailEditorInternal ref={ref} />
      </EmailEditorProvider>
    </ThemeProvider>
  );
});

EmailEditor.displayName = 'EmailEditor';
EmailEditorInternal.displayName = 'EmailEditorInternal';

export default EmailEditor; 