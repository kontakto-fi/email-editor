import React, { forwardRef, useImperativeHandle, useEffect, useMemo, useRef } from 'react';
import { Stack, useTheme, ThemeProvider } from '@mui/material';
import { Theme } from '@mui/material/styles';
import defaultTheme from '../theme';
import { CssBaseline } from '@mui/material';

import { TEditorConfiguration } from '@editor/core';
import {
  useDocument,
  getDocument,
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

/**
 * Wraps a raw HTML string in an editor config with an EmailLayout root + one Html block.
 */
function htmlToEditorConfig(html: string): TEditorConfiguration {
  return {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F5F5F5',
        canvasColor: '#FFFFFF',
        textColor: '#262626',
        fontFamily: 'MODERN_SANS',
        childrenIds: ['block-html-import'],
      },
    },
    'block-html-import': {
      type: 'Html',
      data: {
        style: {
          padding: { top: 0, bottom: 0, right: 0, left: 0 },
        },
        props: {
          contents: html,
        },
      },
    },
  };
}

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
  /**
   * Initial template to load. Can be either:
   * - A `TEditorConfiguration` object (the native editor format)
   * - A raw HTML string, which will be auto-wrapped in an Html block
   */
  initialTemplate?: TEditorConfiguration | string;
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
  /**
   * Optional theme override. If not provided, the default theme will be used.
   * This allows for easy styling without requiring a separate ThemeProvider.
   */
  theme?: Theme;
}

function useDrawerTransition(cssProperty: 'margin-left' | 'margin-right', open: boolean) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open ? transitions.duration.leavingScreen : transitions.duration.enteringScreen,
  });
}

// Internal component that connects the App with the EmailEditor context
const EmailEditorInternal = forwardRef<EmailEditorRef, Omit<EmailEditorProps, 'initialTemplate' | 'initialTemplateId' | 'initialTemplateName' | 'onSave' | 'persistenceEnabled'>>((props, ref) => {
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
    onChange,
  } = props;
  const { saveTemplate, loadTemplate: contextLoadTemplate, currentTemplateId } = useEmailEditor();
  const currentDocument = useDocument();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const samplesDrawerOpen = useSamplesDrawerOpen();

  const marginLeftTransition = useDrawerTransition('margin-left', samplesDrawerOpen);
  const marginRightTransition = useDrawerTransition('margin-right', inspectorDrawerOpen);

  // Notify the consuming app of changes without triggering React state updates
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const prevDocJsonRef = useRef<string>('');
  useEffect(() => {
    const docJson = JSON.stringify(currentDocument);
    if (docJson !== prevDocJsonRef.current) {
      prevDocJsonRef.current = docJson;
      onChangeRef.current?.(currentDocument);
    }
  }, [currentDocument]);

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
      return getDocument();
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
        <TemplatePanel loadTemplates={loadTemplates} saveAs={saveAs} samplesDrawerEnabled={samplesDrawerEnabled} />
      </Stack>
    </Stack>
  );
});

// The main EmailEditor component that external apps will use
const EmailEditor = forwardRef<EmailEditorRef, EmailEditorProps>((props, ref) => {
  const {
    initialTemplate: initialTemplateProp,
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
    theme,
  } = props;

  // Resolve: if it's a raw HTML string, wrap it in an editor config.
  // Memoize so a string prop doesn't create a new object every render.
  const resolvedTemplate = useMemo(
    () => typeof initialTemplateProp === 'string'
      ? htmlToEditorConfig(initialTemplateProp)
      : initialTemplateProp,
    [initialTemplateProp],
  );

  // Reset the editor synchronously during render (not in an effect) so the
  // Zustand store is up-to-date before child components mount / effects fire.
  // This prevents the onChange callback from emitting a stale empty document.
  const prevTemplateRef = useRef<TEditorConfiguration | undefined>(undefined);
  if (resolvedTemplate && resolvedTemplate !== prevTemplateRef.current) {
    prevTemplateRef.current = resolvedTemplate;
    resetDocument(resolvedTemplate);
  }

  // Update persistence mode when it changes
  useEffect(() => {
    setPersistenceEnabled(persistenceEnabled);
  }, [persistenceEnabled]);

  return (
    <ThemeProvider theme={theme || defaultTheme}>
            <CssBaseline />
      <div style={{ height: '100%', overflow: 'auto' }}>
        <SnackbarProvider>
          <EmailEditorProvider
            initialTemplate={resolvedTemplate}
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
              onChange={onChange}
            />
          </EmailEditorProvider>
        </SnackbarProvider>
      </div>
    </ThemeProvider>
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

// Export utility
export { htmlToEditorConfig }; 