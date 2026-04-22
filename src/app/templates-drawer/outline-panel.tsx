import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import {
  setHoveredBlockId,
  setSelectedBlockId,
  useDocument,
  useSelectedBlockId,
} from '@editor/editor-context';
import { TEditorConfiguration } from '@editor/core';

const ROOT_BLOCK_ID = 'root';
const PREVIEW_MAX = 40;

type OutlineNode = {
  id: string;
  label: string;        // Block type, e.g. "Heading"
  preview?: string;     // Short content preview
  children?: OutlineNode[];
};

function previewText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return undefined;
  return trimmed.length > PREVIEW_MAX ? trimmed.slice(0, PREVIEW_MAX - 1) + '…' : trimmed;
}

function buildNode(id: string, doc: TEditorConfiguration): OutlineNode | null {
  const block: any = doc[id];
  if (!block) return null;
  const type: string = block.type;
  const data = block.data ?? {};
  const props = data.props ?? {};

  switch (type) {
    case 'EmailLayout': {
      const children = ((data.childrenIds as string[] | null) ?? [])
        .map((childId) => buildNode(childId, doc))
        .filter((n): n is OutlineNode => n !== null);
      return { id, label: 'Canvas', children };
    }
    case 'Container': {
      const children = ((props.childrenIds as string[] | null) ?? [])
        .map((childId: string) => buildNode(childId, doc))
        .filter((n: OutlineNode | null): n is OutlineNode => n !== null);
      const count = children.length;
      return {
        id,
        label: 'Container',
        preview: count === 1 ? '1 child' : `${count} children`,
        children,
      };
    }
    case 'ColumnsContainer': {
      const columns: Array<{ childrenIds?: string[] }> = props.columns ?? [];
      const children: OutlineNode[] = [];
      columns.forEach((col, colIdx) => {
        const colChildren = (col.childrenIds ?? [])
          .map((childId) => buildNode(childId, doc))
          .filter((n): n is OutlineNode => n !== null);
        children.push({
          id: `${id}::col${colIdx}`,
          label: `Column ${colIdx + 1}`,
          preview: colChildren.length === 1 ? '1 child' : `${colChildren.length} children`,
          children: colChildren,
        });
      });
      return { id, label: 'Columns', preview: `${columns.length} columns`, children };
    }
    case 'Text':
    case 'Heading':
    case 'Button':
      return { id, label: type, preview: previewText(props.text) };
    case 'Html':
      return { id, label: 'Html', preview: previewText(props.contents) };
    case 'Image':
      return { id, label: 'Image', preview: previewText(props.alt) ?? previewText(props.url) };
    case 'Avatar':
      return { id, label: 'Avatar', preview: previewText(props.imageUrl) };
    case 'Divider':
      return { id, label: 'Divider' };
    case 'Spacer':
      return { id, label: 'Spacer', preview: props.height ? `${props.height}px` : undefined };
    case 'Signature':
      return { id, label: 'Signature', preview: previewText(props.name) };
    default:
      return { id, label: type };
  }
}

export default function OutlinePanel() {
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();
  const tree = buildNode(ROOT_BLOCK_ID, document);

  return (
    <Box>
      <Typography variant="subtitle2" component="h2" sx={{ fontWeight: 'bold', mb: 0.5, px: 0.5 }}>
        Outline
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', px: 0.5, mb: 1 }}>
        Click a row to select the block. Hover to highlight it on the canvas.
      </Typography>
      {tree ? (
        <OutlineRow node={tree} depth={0} selectedBlockId={selectedBlockId} />
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', px: 0.5 }}>
          Nothing to outline.
        </Typography>
      )}
    </Box>
  );
}

type OutlineRowProps = {
  node: OutlineNode;
  depth: number;
  selectedBlockId: string | null;
};

function OutlineRow({ node, depth, selectedBlockId }: OutlineRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  // Synthetic ids like "<id>::col0" aren't real blocks and shouldn't be selectable.
  const isSelectable = !node.id.includes('::');
  const isSelected = isSelectable && selectedBlockId === node.id;

  const handleClick = () => {
    if (isSelectable) setSelectedBlockId(node.id);
  };

  const handleEnter = () => {
    if (isSelectable) setHoveredBlockId(node.id);
  };
  const handleLeave = () => {
    if (isSelectable) setHoveredBlockId(null);
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        sx={{
          pl: `${depth * 12 + 4}px`,
          pr: 0.5,
          py: 0.25,
          minHeight: 28,
          borderRadius: 0.75,
          cursor: isSelectable ? 'pointer' : 'default',
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? 'action.selected' : 'action.hover',
          },
        }}
      >
        {hasChildren ? (
          <Box
            role="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            {expanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
          </Box>
        ) : (
          <Box sx={{ width: 20 }} />
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isSelected ? 'primary.main' : 'text.primary',
            flexShrink: 0,
          }}
        >
          {node.label}
        </Typography>
        {node.preview && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            — {node.preview}
          </Typography>
        )}
      </Stack>
      {hasChildren && expanded && (
        <Box>
          {node.children!.map((child) => (
            <OutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedBlockId={selectedBlockId}
            />
          ))}
        </Box>
      )}
    </>
  );
}
