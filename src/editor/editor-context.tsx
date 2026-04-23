import { create } from 'zustand';
import { TEditorConfiguration } from './core';
import type { ParentRef } from './blocks/helpers/move-block';

export type TFocusedEditable = {
  blockId: string; // 'subject' for the EmailLayout subject input
  field: 'text' | 'contents' | 'subject';
  selectionStart: number;
  selectionEnd: number;
};

export type TDraggingBlock = {
  sourceId: string;
  sourceParent: ParentRef;
};

type TValue = {
  document: TEditorConfiguration;
  selectedBlockId: string | null;
  selectedSidebarTab: 'block-configuration' | 'styles' | 'template-settings' | 'variables';
  selectedMainTab: 'editor' | 'preview' | 'json' | 'html' | 'text';
  selectedScreenSize: 'desktop' | 'mobile';
  inspectorDrawerOpen: boolean;
  samplesDrawerOpen: boolean;
  persistenceEnabled: boolean;
  lastFocusedEditable: TFocusedEditable | null;
  hoveredBlockId: string | null;
  draggingBlock: TDraggingBlock | null;
  workspaceBackground: 'checkerboard' | 'solid';
};

// Initialize with an empty document
const EMPTY_DOCUMENT: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#262626',
      fontFamily: 'MODERN_SANS',
      childrenIds: [],
    },
  },
};

const editorStateStore = create<TValue>(() => ({
  document: EMPTY_DOCUMENT,
  selectedBlockId: null,
  selectedSidebarTab: 'styles',
  selectedMainTab: 'editor',
  selectedScreenSize: 'desktop',
  inspectorDrawerOpen: true,
  samplesDrawerOpen: true,
  persistenceEnabled: false,
  lastFocusedEditable: null,
  hoveredBlockId: null,
  draggingBlock: null,
  workspaceBackground: 'checkerboard',
}));

export function useDocument() {
  return editorStateStore((s) => s.document);
}

export function useSelectedBlockId() {
  return editorStateStore((s) => s.selectedBlockId);
}

export function useSelectedScreenSize() {
  return editorStateStore((s) => s.selectedScreenSize);
}

export function useSelectedMainTab() {
  return editorStateStore((s) => s.selectedMainTab);
}

export function setSelectedMainTab(selectedMainTab: TValue['selectedMainTab']) {
  return editorStateStore.setState({ selectedMainTab });
}

export function useSelectedSidebarTab() {
  return editorStateStore((s) => s.selectedSidebarTab);
}

export function useInspectorDrawerOpen() {
  return editorStateStore((s) => s.inspectorDrawerOpen);
}

export function useSamplesDrawerOpen() {
  return editorStateStore((s) => s.samplesDrawerOpen);
}

export function usePersistenceEnabled() {
  return editorStateStore((s) => s.persistenceEnabled);
}

export function setSelectedBlockId(selectedBlockId: TValue['selectedBlockId']) {
  const selectedSidebarTab = selectedBlockId === null ? 'styles' : 'block-configuration';
  const options: Partial<TValue> = {};
  if (selectedBlockId !== null) {
    options.inspectorDrawerOpen = true;
  }
  return editorStateStore.setState({
    selectedBlockId,
    selectedSidebarTab,
    ...options,
  });
}

export function setSidebarTab(selectedSidebarTab: TValue['selectedSidebarTab']) {
  return editorStateStore.setState({ selectedSidebarTab });
}

export function resetDocument(document: TValue['document']) {
  return editorStateStore.setState({
    document,
    selectedSidebarTab: 'styles',
    selectedBlockId: null,
  });
}

export function getDocument() {
  return editorStateStore.getState().document;
}

export function setDocument(document: TValue['document']) {
  const originalDocument = editorStateStore.getState().document;
  
  editorStateStore.setState({
    document: {
      ...originalDocument,
      ...document,
    },
  });
}

export function toggleInspectorDrawerOpen() {
  const inspectorDrawerOpen = !editorStateStore.getState().inspectorDrawerOpen;
  return editorStateStore.setState({ inspectorDrawerOpen });
}

export function toggleSamplesDrawerOpen() {
  const samplesDrawerOpen = !editorStateStore.getState().samplesDrawerOpen;
  return editorStateStore.setState({ samplesDrawerOpen });
}

export function setSelectedScreenSize(selectedScreenSize: TValue['selectedScreenSize']) {
  return editorStateStore.setState({ selectedScreenSize });
}

export function setPersistenceEnabled(persistenceEnabled: boolean) {
  return editorStateStore.setState({ persistenceEnabled });
}

export function useLastFocusedEditable() {
  return editorStateStore((s) => s.lastFocusedEditable);
}

export function getLastFocusedEditable() {
  return editorStateStore.getState().lastFocusedEditable;
}

export function useHoveredBlockId() {
  return editorStateStore((s) => s.hoveredBlockId);
}

export function setHoveredBlockId(hoveredBlockId: TValue['hoveredBlockId']) {
  return editorStateStore.setState({ hoveredBlockId });
}

export function useDraggingBlock() {
  return editorStateStore((s) => s.draggingBlock);
}

export function getDraggingBlock() {
  return editorStateStore.getState().draggingBlock;
}

export function setDraggingBlock(draggingBlock: TValue['draggingBlock']) {
  return editorStateStore.setState({ draggingBlock });
}

export function useWorkspaceBackground() {
  return editorStateStore((s) => s.workspaceBackground);
}

export function setWorkspaceBackground(workspaceBackground: TValue['workspaceBackground']) {
  return editorStateStore.setState({ workspaceBackground });
}

export function setLastFocusedEditable(lastFocusedEditable: TFocusedEditable | null) {
  return editorStateStore.setState({ lastFocusedEditable });
}
