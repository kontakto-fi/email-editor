import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Stack, useTheme } from '@mui/material';

import { TEditorConfiguration } from '@editor/core';
import { useDocument, resetDocument, useInspectorDrawerOpen, useSamplesDrawerOpen } from '@editor/editor-context';
import { EmailEditorProvider, useEmailEditor, EmailEditorContextType, EmailEditorProviderProps } from './context';
import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from './inspector-drawer';
import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from './samples-drawer';
import TemplatePanel from './template-panel';

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

function useDrawerTransition(cssProperty: 'margin-left' | 'margin-right', open: boolean) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open ? transitions.duration.leavingScreen : transitions.duration.enteringScreen,
  });
}

// Internal component that connects the App with the EmailEditor context
const EmailEditorInternal = forwardRef<EmailEditorRef, {}>((_props, ref) => {
  const { template, updateTemplate, saveTemplate, loadTemplate } = useEmailEditor();
  const currentDocument = useDocument();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const samplesDrawerOpen = useSamplesDrawerOpen();

  const marginLeftTransition = useDrawerTransition('margin-left', samplesDrawerOpen);
  const marginRightTransition = useDrawerTransition('margin-right', inspectorDrawerOpen);

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

  return (
    <Stack position="relative" id="drawer-container">
      <InspectorDrawer />
      <SamplesDrawer />

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          marginLeft: samplesDrawerOpen ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
          transition: [marginLeftTransition, marginRightTransition].join(', '),
        }}
      >
        <TemplatePanel />
      </Stack>
    </Stack>
  );
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
    <EmailEditorProvider 
      initialTemplate={initialTemplate}
      onSave={onSave}
      onChange={onChange}
    >
      <EmailEditorInternal ref={ref} />
    </EmailEditorProvider>
  );
});

EmailEditor.displayName = 'EmailEditor';
EmailEditorInternal.displayName = 'EmailEditorInternal';

// Export both as default and named
export default EmailEditor;
export { EmailEditor };

// Export context and hooks
export {
  EmailEditorProvider,
  useEmailEditor,
  type EmailEditorContextType,
  type EmailEditorProviderProps
}; 