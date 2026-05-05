import React, { createContext, useContext } from 'react';

import { TEditorBlock } from '@editor/core';

export type CustomBlock = {
  label: string;
  icon?: React.ReactNode;
  blocks: Record<string, TEditorBlock>;
  rootBlockId: string;
};

export type EditorConfig = {
  favoriteColors?: string[];
  customBlocks?: CustomBlock[];
  onTestSend?: (payload: { html: string; text: string; subject?: string }) => void | Promise<void>;
};

const EditorConfigContext = createContext<EditorConfig>({});

export function EditorConfigProvider({
  config,
  children,
}: {
  config: EditorConfig;
  children: React.ReactNode;
}) {
  return <EditorConfigContext.Provider value={config}>{children}</EditorConfigContext.Provider>;
}

export function useEditorConfig(): EditorConfig {
  return useContext(EditorConfigContext);
}
