import { create, useStore } from 'zustand';
import { temporal } from 'zundo';

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

// Leading-edge throttle so rapid consecutive document mutations (dragging a
// slider, typing) collapse into a single history entry: only the pre-burst
// state is pushed, subsequent changes inside the window are dropped from the
// undo stack (they remain in the document, just not as separate entries).
const COALESCE_MS = 300;
function leadingThrottle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let last = Number.NEGATIVE_INFINITY;
  return (...args: Args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

const editorStateStore = create<TValue>()(
  temporal(
    () => ({
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
    }),
    {
      limit: 100,
      // Only the document participates in history — selection, drawers, tabs
      // and other UI state are intentionally excluded.
      partialize: (state) => ({ document: state.document }),
      // Skip UI-only state changes: if the document reference is unchanged,
      // no history entry is recorded.
      equality: (a, b) => a.document === b.document,
      handleSet: (handleSet) =>
        leadingThrottle<Parameters<typeof handleSet>>(
          (pastState, replace, currentState) => handleSet(pastState, replace, currentState),
          COALESCE_MS,
        ),
    },
  ),
);

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
  // Loading a fresh template should not itself appear as an undoable step,
  // and any prior history no longer applies to the new document.
  const temporalApi = editorStateStore.temporal.getState();
  temporalApi.pause();
  editorStateStore.setState({
    document,
    selectedSidebarTab: 'styles',
    selectedBlockId: null,
  });
  temporalApi.clear();
  temporalApi.resume();
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

// Replace the full document (unlike setDocument, does not merge with the
// current one). Preserves undo history — use this for document-wide edits
// such as block deletions that need to drop keys from the map. Distinct from
// resetDocument, which clears history because it implies a fresh template.
export function replaceDocument(document: TValue['document']) {
  editorStateStore.setState({ document });
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

// ---------------------------------------------------------------------------
// Undo / redo
// ---------------------------------------------------------------------------

export function undo() {
  editorStateStore.temporal.getState().undo();
}

export function redo() {
  editorStateStore.temporal.getState().redo();
}

export function clearHistory() {
  editorStateStore.temporal.getState().clear();
}

export function useCanUndo() {
  return useStore(editorStateStore.temporal, (s) => s.pastStates.length > 0);
}

export function useCanRedo() {
  return useStore(editorStateStore.temporal, (s) => s.futureStates.length > 0);
}
