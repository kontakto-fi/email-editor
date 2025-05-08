import React, { createContext, useContext, useState, useCallback } from 'react';
import { TEditorConfiguration } from '@editor/core';

// Type for stored template
export interface StoredTemplate {
  id: string;
  name: string;
  content: TEditorConfiguration;
  createdAt: string;
  updatedAt: string;
}

export interface EmailEditorContextType {
  template: TEditorConfiguration;
  currentTemplateId: string | null;
  currentTemplateName: string | null;
  updateTemplate: (template: TEditorConfiguration) => void;
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
  initialTemplate,
  initialTemplateId = null,
  initialTemplateName = null,
  onSave,
  onChange,
}) => {
  const [template, setTemplate] = useState<TEditorConfiguration>(initialTemplate || {});
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(initialTemplateId);
  const [currentTemplateName, setCurrentTemplateName] = useState<string | null>(initialTemplateName);
  const [saveListeners, setSaveListeners] = useState<((template: TEditorConfiguration) => void)[]>([]);

  const updateTemplate = useCallback((newTemplate: TEditorConfiguration) => {
    setTemplate(newTemplate);
    if (onChange) {
      onChange(newTemplate);
    }
  }, [onChange]);

  const saveTemplate = useCallback(() => {
    // Call all registered save listeners
    saveListeners.forEach(listener => listener(template));
    if (onSave) {
      onSave(template);
    }
    return template;
  }, [template, saveListeners, onSave]);

  const loadTemplate = useCallback((newTemplate: TEditorConfiguration, templateId?: string, templateName?: string) => {
    setTemplate(newTemplate);
    
    if (templateId !== undefined) {
      setCurrentTemplateId(templateId);
    }
    
    if (templateName !== undefined) {
      setCurrentTemplateName(templateName);
    }
    
    if (onChange) {
      onChange(newTemplate);
    }
  }, [onChange]);

  const setCurrentTemplate = useCallback((templateId: string | null, templateName: string | null) => {
    setCurrentTemplateId(templateId);
    setCurrentTemplateName(templateName);
  }, []);

  const registerSaveListener = useCallback((callback: (template: TEditorConfiguration) => void) => {
    setSaveListeners(prev => [...prev, callback]);
    return () => {
      setSaveListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);

  const value = {
    template,
    currentTemplateId,
    currentTemplateName,
    updateTemplate,
    saveTemplate,
    loadTemplate,
    registerSaveListener,
    setCurrentTemplate
  };

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