import React, { Fragment, useState } from 'react';

import { Box } from '@mui/material';

import { TEditorBlock } from '@editor/core';
import EditorBlock from '@editor/editor-block';
import {
  getDraggingBlock,
  setDraggingBlock,
  setDocument,
  setSelectedBlockId,
  useDocument,
  useDraggingBlock,
} from '@editor/editor-context';

import AddBlockButton from './add-block-menu';
import { BlockParentProvider } from '../block-parent-context';
import { buildMovePatch, isDescendant, type ParentRef } from '../move-block';

export type EditorChildrenChange = {
  blockId: string;
  block: TEditorBlock;
  childrenIds: string[];
};

function generateId() {
  return `block-${Date.now()}`;
}

export type EditorChildrenIdsProps = {
  childrenIds: string[] | null | undefined;
  onChange: (val: EditorChildrenChange) => void;
  /** Parent context for DnD — see BlockParentContext. Required for drag/drop to work in this container. */
  parentRef?: ParentRef;
};

export default function EditorChildrenIds({ childrenIds, onChange, parentRef }: EditorChildrenIdsProps) {
  const appendBlock = (block: TEditorBlock) => {
    const blockId = generateId();
    return onChange({
      blockId,
      block,
      childrenIds: [...(childrenIds || []), blockId],
    });
  };

  const insertBlock = (block: TEditorBlock, index: number) => {
    const blockId = generateId();
    const newChildrenIds = [...(childrenIds || [])];
    newChildrenIds.splice(index, 0, blockId);
    return onChange({
      blockId,
      block,
      childrenIds: newChildrenIds,
    });
  };

  if (!childrenIds || childrenIds.length === 0) {
    return (
      <>
        <AddBlockButton placeholder onSelect={appendBlock} />
        {parentRef && (
          <CanvasDropZone parentRef={parentRef} targetIndex={0} placeholder />
        )}
      </>
    );
  }

  return (
    <>
      {childrenIds.map((childId, i) => (
        <Fragment key={childId}>
          <AddBlockButton onSelect={(block) => insertBlock(block, i)} />
          {parentRef && <CanvasDropZone parentRef={parentRef} targetIndex={i} />}
          {parentRef ? (
            <BlockParentProvider info={{ parent: parentRef, indexInParent: i }}>
              <EditorBlock id={childId} />
            </BlockParentProvider>
          ) : (
            <EditorBlock id={childId} />
          )}
        </Fragment>
      ))}
      <AddBlockButton onSelect={appendBlock} />
      {parentRef && <CanvasDropZone parentRef={parentRef} targetIndex={childrenIds.length} />}
    </>
  );
}

function CanvasDropZone({
  parentRef,
  targetIndex,
  placeholder = false,
}: {
  parentRef: ParentRef;
  targetIndex: number;
  placeholder?: boolean;
}) {
  const document = useDocument();
  const dragging = useDraggingBlock();
  const [over, setOver] = useState(false);

  if (!dragging) return null;

  // Skip this drop zone if it would move the block into its own subtree, or if
  // it's the trivial "drop on own position" no-op.
  if (isDescendant(document, dragging.sourceId, parentRef.parentId)) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOver(true);
  };
  const handleDragLeave = () => setOver(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const payload = getDraggingBlock();
    if (!payload) return;
    const patch = buildMovePatch(
      document,
      payload.sourceId,
      payload.sourceParent,
      parentRef,
      targetIndex,
    );
    if (patch) {
      setDocument(patch as any);
      setSelectedBlockId(payload.sourceId);
    }
    setDraggingBlock(null);
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        height: placeholder ? 64 : over ? 16 : 8,
        mx: placeholder ? 2 : 3,
        my: placeholder ? 0 : over ? 0.5 : 0,
        borderRadius: 1,
        backgroundColor: over ? 'rgba(25, 118, 210, 0.16)' : 'transparent',
        outline: over ? '1.5px dashed rgba(25, 118, 210, 0.8)' : undefined,
        transition: 'height 80ms, background-color 80ms, outline-color 80ms',
      }}
    />
  );
}
