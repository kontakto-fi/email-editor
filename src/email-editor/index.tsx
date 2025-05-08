// Export the main EmailEditor component
export { default as EmailEditor } from './email-editor';
export type { EmailEditorProps, EmailEditorRef } from './email-editor';

// Export the context and hooks
export { 
  EmailEditorProvider, 
  useEmailEditor,
  type EmailEditorContextType,
  type EmailEditorProviderProps 
} from './context'; 