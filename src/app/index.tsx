import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Stack, useTheme } from '@mui/material';

import { TEditorConfiguration } from '@editor/core';
import { 
  useDocument, 
  resetDocument, 
  useInspectorDrawerOpen, 
  useSamplesDrawerOpen,
  setPersistenceEnabled
} from '@editor/editor-context';
import { EmailEditorProvider, useEmailEditor, EmailEditorContextType, EmailEditorProviderProps } from './context';
import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from './inspector-drawer';
import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from './templates-drawer';
import TemplatePanel from './email-canvas';
import { SnackbarProvider } from './email-canvas/snackbar-provider';

// Define the SampleTemplate interface directly here
export interface SampleTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnail?: string;
}

// The ref interface for imperative controls
export interface EmailEditorRef {
  saveTemplate: () => TEditorConfiguration;
  loadTemplate: (template: TEditorConfiguration) => void;
  getTemplate: () => TEditorConfiguration;
}

// Props for the EmailEditor component
export interface EmailEditorProps {
  initialTemplate?: TEditorConfiguration;
  initialTemplateId?: string;
  initialTemplateName?: string;
  onSave?: (template: TEditorConfiguration) => void;
  onChange?: (template: TEditorConfiguration) => void;
  /**
   * Duration for drawer enter transition in milliseconds. Set to 0 for instant.
   * @default 225
   */
  drawerEnterDuration?: number;
  /**
   * Duration for drawer exit transition in milliseconds. Set to 0 for instant.
   * @default 225
   */
  drawerExitDuration?: number;
  /**
   * Whether to show the samples drawer.
   * @default true
   */
  samplesDrawerEnabled?: boolean;
  /**
   * Whether to enable template persistence functionality and show save buttons.
   * When false (default), save functionality and related UI elements will be hidden.
   * When true, make sure to provide the necessary callbacks (onSave, saveAs, etc.).
   * 
   * IMPORTANT: If you set this to true, you must provide callbacks to handle persistence
   * operations (onSave, saveAs, etc.). Otherwise, the save buttons will appear but won't
   * be functional.
   * @default false
   */
  persistenceEnabled?: boolean;
  /**
   * Minimum height of the editor container.
   * @default '100vh'
   */
  minHeight?: string;
  /**
   * Callback to load samples dynamically.
   * This will be called when the samples drawer is opened.
   */
  loadSamples?: () => Promise<SampleTemplate[]>;
  /**
   * Callback to load existing templates dynamically.
   * This will be called when the samples drawer is opened.
   */
  loadTemplates?: () => Promise<SampleTemplate[]>;
  /**
   * Callback to load a specific template by ID.
   * This will be called when a sample is selected from the drawer.
   */
  loadTemplate?: (templateId: string) => Promise<TEditorConfiguration | null>;
  /**
   * Callback to delete a template by ID.
   */
  deleteTemplate?: (templateId: string) => void;
  /**
   * Callback to copy a template with a new name.
   */
  copyTemplate?: (templateName: string, content: any) => void;
  /**
   * Callback to save a template with a new name.
   */
  saveAs?: (templateName: string, content: any) => Promise<{id: string, name: string}>;
}

function useDrawerTransition(cssProperty: 'margin-left' | 'margin-right', open: boolean) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open ? transitions.duration.leavingScreen : transitions.duration.enteringScreen,
  });
}

// Internal component that connects the App with the EmailEditor context
const EmailEditorInternal = forwardRef<EmailEditorRef, Omit<EmailEditorProps, 'initialTemplate' | 'initialTemplateId' | 'initialTemplateName' | 'onSave' | 'onChange' | 'persistenceEnabled'>>((props, ref) => {
  const { 
    drawerEnterDuration = 225,
    drawerExitDuration = 225,
    samplesDrawerEnabled = true,
    minHeight = '100vh',
    loadSamples,
    loadTemplates,
    loadTemplate,
    deleteTemplate,
    copyTemplate,
    saveAs,
  } = props;
  const { template, updateTemplate, saveTemplate, loadTemplate: contextLoadTemplate, currentTemplateId } = useEmailEditor();
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
      contextLoadTemplate(newTemplate);
      resetDocument(newTemplate);
    },
    getTemplate: () => {
      return template;
    }
  }));

  return (
    <Stack position="relative" id="drawer-container" sx={{ minHeight }}>
      <InspectorDrawer 
        enterDuration={drawerEnterDuration}
        exitDuration={drawerExitDuration}
        deleteTemplate={deleteTemplate}
        copyTemplate={copyTemplate}
      />
      <SamplesDrawer 
        enterDuration={drawerEnterDuration}
        exitDuration={drawerExitDuration}
        enabled={samplesDrawerEnabled}
        loadSamples={loadSamples}
        loadTemplates={loadTemplates}
        loadTemplate={loadTemplate}
        currentTemplateId={currentTemplateId}
        deleteTemplate={deleteTemplate}
      />

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          marginLeft: samplesDrawerOpen && samplesDrawerEnabled ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
          transition: [marginLeftTransition, marginRightTransition].join(', '),
        }}
      >
        <TemplatePanel loadTemplates={loadTemplates} saveAs={saveAs} />
      </Stack>
    </Stack>
  );
});

// The main EmailEditor component that external apps will use
const EmailEditor = forwardRef<EmailEditorRef, EmailEditorProps>((props, ref) => {
  const { 
    initialTemplate, 
    initialTemplateId,
    initialTemplateName,
    onSave, 
    onChange,
    drawerEnterDuration,
    drawerExitDuration,
    samplesDrawerEnabled,
    persistenceEnabled = false,
    minHeight = '100vh',
    loadSamples,
    loadTemplates,
    loadTemplate,
    deleteTemplate,
    copyTemplate,
    saveAs,
  } = props;

  // Initialize with the provided template and settings
  useEffect(() => {
    if (initialTemplate) {
      resetDocument(initialTemplate);
    }
    
    // Set persistence mode
    setPersistenceEnabled(persistenceEnabled);
  }, [initialTemplate, persistenceEnabled]);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <SnackbarProvider>
        <EmailEditorProvider 
          initialTemplate={initialTemplate}
          initialTemplateId={initialTemplateId}
          initialTemplateName={initialTemplateName}
          onSave={onSave}
          onChange={onChange}
        >
          <EmailEditorInternal 
            ref={ref} 
            drawerEnterDuration={drawerEnterDuration}
            drawerExitDuration={drawerExitDuration}
            samplesDrawerEnabled={samplesDrawerEnabled}
            minHeight={minHeight}
            loadSamples={loadSamples}
            loadTemplates={loadTemplates}
            loadTemplate={loadTemplate}
            deleteTemplate={deleteTemplate}
            copyTemplate={copyTemplate}
            saveAs={saveAs}
          />
        </EmailEditorProvider>
      </SnackbarProvider>
    </div>
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