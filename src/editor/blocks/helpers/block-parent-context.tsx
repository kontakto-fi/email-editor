import React, { createContext, useContext } from 'react';
import type { ParentRef } from './move-block';

export type BlockParentInfo = {
  parent: ParentRef;
  indexInParent: number;
};

const BlockParentContext = createContext<BlockParentInfo | null>(null);

/**
 * Tells the subtree (an `EditorBlock` and its wrapper) which parent
 * container + slot it's rendered under. Used by the block wrapper to
 * construct the drag-source payload for canvas drag-and-drop.
 */
export function BlockParentProvider({
  info,
  children,
}: {
  info: BlockParentInfo;
  children: React.ReactNode;
}) {
  return <BlockParentContext.Provider value={info}>{children}</BlockParentContext.Provider>;
}

export function useBlockParent(): BlockParentInfo | null {
  return useContext(BlockParentContext);
}
