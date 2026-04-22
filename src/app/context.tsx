import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { TEditorConfiguration } from '@editor/core';
import { getDocument } from '@editor/editor-context';

// Type for stored template
export interface StoredTemplate {
  id: string;
  name: string;
  content: TEditorConfiguration;
  createdAt: string;
  updatedAt: string;
  description?: string;
  subject?: string;
  tags?: string[];
}

export interface EmailEditorContextType {
  currentTemplateId: string | null;
  currentTemplateName: string | null;
  saveTemplate: () => TEditorConfiguration;
  loadTemplate: (template: TEditorConfiguration, templateId?: string, templateName?: string) => void;
  registerSaveListener: (callback: (template: TEditorConfiguration) => void) => () => void;
  setCurrentTemplate: (templateId: string | null, templateName: string | null) => void;
}

const EmailEditorContext = createContext<EmailEditorContextType | null>(null);

export interface EmailEditorProviderProps {
  children: React.ReactNode;
  initialTemplate?: TEditorConfiguration;
  initialTemplateId?: string;
  initialTemplateName?: string;
  onSave?: (template: TEditorConfiguration) => void;
  onChange?: (template: TEditorConfiguration) => void;
}

export const EmailEditorProvider: React.FC<EmailEditorProviderProps> = ({
  children,
  initialTemplateId = null,
  initialTemplateName = null,
  onSave,
}) => {
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(initialTemplateId);
  const [currentTemplateName, setCurrentTemplateName] = useState<string | null>(initialTemplateName);
  const saveListenersRef = useRef<((template: TEditorConfiguration) => void)[]>([]);

  // Use ref for onSave callback to keep context value stable
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const saveTemplate = useCallback(() => {
    const currentDoc = getDocument();
    saveListenersRef.current.forEach(listener => listener(currentDoc));
    if (onSaveRef.current) {
      onSaveRef.current(currentDoc);
    }
    return currentDoc;
  }, []);

  const loadTemplate = useCallback((newTemplate: TEditorConfiguration, templateId?: string, templateName?: string) => {
    if (templateId !== undefined) {
      setCurrentTemplateId(templateId);
    }

    if (templateName !== undefined) {
      setCurrentTemplateName(templateName);
    }
  }, []);

  const setCurrentTemplate = useCallback((templateId: string | null, templateName: string | null) => {
    setCurrentTemplateId(templateId);
    setCurrentTemplateName(templateName);
  }, []);

  const registerSaveListener = useCallback((callback: (template: TEditorConfiguration) => void) => {
    saveListenersRef.current = [...saveListenersRef.current, callback];
    return () => {
      saveListenersRef.current = saveListenersRef.current.filter(listener => listener !== callback);
    };
  }, []);

  const value = useMemo(() => ({
    currentTemplateId,
    currentTemplateName,
    saveTemplate,
    loadTemplate,
    registerSaveListener,
    setCurrentTemplate
  }), [currentTemplateId, currentTemplateName, saveTemplate, loadTemplate, registerSaveListener, setCurrentTemplate]);

  return (
    <EmailEditorContext.Provider value={value}>
      {children}
    </EmailEditorContext.Provider>
  );
};

export const useEmailEditor = () => {
  const context = useContext(EmailEditorContext);
  if (!context) {
    throw new Error('useEmailEditor must be used within an EmailEditorProvider');
  }
  return context;
};
