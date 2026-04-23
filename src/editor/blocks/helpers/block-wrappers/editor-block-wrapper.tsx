import React, { CSSProperties, useState } from 'react';

import { Box } from '@mui/material';

import { useCurrentBlockId } from '@editor/editor-block';
import {
  setDraggingBlock,
  setSelectedBlockId,
  useDraggingBlock,
  useHoveredBlockId,
  useSelectedBlockId,
} from '@editor/editor-context';

import { useBlockParent } from '../block-parent-context';

import TuneMenu from './tune-menu';

type TEditorBlockWrapperProps = {
  children: JSX.Element;
};

export default function EditorBlockWrapper({ children }: TEditorBlockWrapperProps) {
  const selectedBlockId = useSelectedBlockId();
  const hoveredBlockId = useHoveredBlockId();
  const draggingBlock = useDraggingBlock();
  const blockParent = useBlockParent();
  const [mouseInside, setMouseInside] = useState(false);
  const blockId = useCurrentBlockId();

  const isBeingDragged = draggingBlock?.sourceId === blockId;

  let outline: CSSProperties['outline'];
  if (selectedBlockId === blockId) {
    outline = '2px solid rgba(0,121,204, 1)';
  } else if ((mouseInside && !draggingBlock) || hoveredBlockId === blockId) {
    outline = '2px solid rgba(0,121,204, 0.3)';
  }

  const renderMenu = () => {
    if (selectedBlockId !== blockId) {
      return null;
    }
    return <TuneMenu blockId={blockId} />;
  };

  // Drag support: only enable when the wrapper has a parent context — the
  // root EmailLayout (which owns its own drag-free surface) has no parent.
  // Also disable while the block is selected so click-drag and Shift+Arrow
  // work for text selection inside the textarea.
  const draggable = Boolean(blockParent) && selectedBlockId !== blockId;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!blockParent) return;
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    setDraggingBlock({ sourceId: blockId, sourceParent: blockParent.parent });
  };

  const handleDragEnd = () => {
    setDraggingBlock(null);
  };

  return (
    <Box
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        position: 'relative',
        maxWidth: '100%',
        outlineOffset: '-1px',
        outline,
        opacity: isBeingDragged ? 0.4 : 1,
        cursor: draggable ? (draggingBlock ? 'grabbing' : 'default') : 'default',
      }}
      onMouseEnter={(ev) => {
        setMouseInside(true);
        ev.stopPropagation();
      }}
      onMouseLeave={() => {
        setMouseInside(false);
      }}
      onClick={(ev) => {
        setSelectedBlockId(blockId);
        ev.stopPropagation();
      }}
    >
      {renderMenu()}
      {children}
    </Box>
  );
}
