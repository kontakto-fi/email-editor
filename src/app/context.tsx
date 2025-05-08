import React, { createContext, useContext, useState, useCallback } from 'react';
import { TEditorConfiguration } from '@editor/core';

export interface EmailEditorContextType {
  template: TEditorConfiguration;
  updateTemplate: (template: TEditorConfiguration) => void;
  saveTemplate: () => TEditorConfiguration;
  loadTemplate: (template: TEditorConfiguration) => void;
  registerSaveListener: (callback: (template: TEditorConfiguration) => void) => () => void;
}

const EmailEditorContext = createContext<EmailEditorContextType | null>(null);

export interface EmailEditorProviderProps {
  children: React.ReactNode;
  initialTemplate?: TEditorConfiguration;
  onSave?: (template: TEditorConfiguration) => void;
  onChange?: (template: TEditorConfiguration) => void;
}

export const EmailEditorProvider: React.FC<EmailEditorProviderProps> = ({
  children,
  initialTemplate,
  onSave,
  onChange,
}) => {
  const [template, setTemplate] = useState<TEditorConfiguration>(initialTemplate || {});
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

  const loadTemplate = useCallback((newTemplate: TEditorConfiguration) => {
    setTemplate(newTemplate);
    if (onChange) {
      onChange(newTemplate);
    }
  }, [onChange]);

  const registerSaveListener = useCallback((callback: (template: TEditorConfiguration) => void) => {
    setSaveListeners(prev => [...prev, callback]);
    return () => {
      setSaveListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);

  const value = {
    template,
    updateTemplate,
    saveTemplate,
    loadTemplate,
    registerSaveListener
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