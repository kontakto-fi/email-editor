import React, { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  AccountCircleOutlined,
  BusinessOutlined,
  ChevronRight,
  ContactMailOutlined,
  Crop32Outlined,
  DashboardOutlined,
  ExpandMore,
  HMobiledataOutlined,
  HorizontalRuleOutlined,
  HtmlOutlined,
  ImageOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LibraryAddOutlined,
  NotesOutlined,
  SmartButtonOutlined,
  ViewColumnOutlined,
  ViewColumnSharp,
} from '@mui/icons-material';
import {
  setDocument,
  setHoveredBlockId,
  setSelectedBlockId,
  useDocument,
  useSelectedBlockId,
} from '@editor/editor-context';
import { TEditorConfiguration } from '@editor/core';
import { t } from '@i18n';
import {
  buildMovePatch,
  isDescendant,
  type ParentRef,
} from '@editor/blocks/helpers/move-block';

const ROOT_BLOCK_ID = 'root';
const PREVIEW_MAX = 36;

type OutlineNode = {
  id: string;
  label: string;
  preview?: string;
  icon: React.ReactNode;
  children?: OutlineNode[];
  // Populated for real blocks; omitted for synthetic rows (Canvas, Column i).
  parent?: ParentRef;
  indexInParent?: number;
  siblingsCount?: number;
  // Parent ref whose childrenIds this node addresses when it's itself a
  // container (EmailLayout / Container / ColumnsContainer column). Used as
  // the target when a block is dropped onto this row.
  containerChildrenRef?: ParentRef;
};

function iconForType(type: string): React.ReactNode {
  switch (type) {
    case 'EmailLayout':
      return <DashboardOutlined fontSize="small" />;
    case 'Heading':
      return <HMobiledataOutlined fontSize="small" />;
    case 'Text':
      return <NotesOutlined fontSize="small" />;
    case 'Button':
      return <SmartButtonOutlined fontSize="small" />;
    case 'Image':
      return <ImageOutlined fontSize="small" />;
    case 'Avatar':
      return <AccountCircleOutlined fontSize="small" />;
    case 'Signature':
      return <ContactMailOutlined fontSize="small" />;
    case 'Divider':
      return <HorizontalRuleOutlined fontSize="small" />;
    case 'Spacer':
      return <Crop32Outlined fontSize="small" />;
    case 'Html':
      return <HtmlOutlined fontSize="small" />;
    case 'Container':
      return <LibraryAddOutlined fontSize="small" />;
    case 'ColumnsContainer':
      return <ViewColumnOutlined fontSize="small" />;
    default:
      return <BusinessOutlined fontSize="small" />;
  }
}

function previewText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return undefined;
  return trimmed.length > PREVIEW_MAX ? trimmed.slice(0, PREVIEW_MAX - 1) + '…' : trimmed;
}

type BuildCtx = {
  parent: ParentRef;
  indexInParent: number;
  siblingsCount: number;
};

function buildNode(id: string, doc: TEditorConfiguration, ctx?: BuildCtx): OutlineNode | null {
  const block: any = doc[id];
  if (!block) return null;
  const type: string = block.type;
  const data = block.data ?? {};
  const props = data.props ?? {};
  const baseMeta: Partial<OutlineNode> = ctx
    ? { parent: ctx.parent, indexInParent: ctx.indexInParent, siblingsCount: ctx.siblingsCount }
    : {};

  switch (type) {
    case 'EmailLayout': {
      const ids = (data.childrenIds as string[] | null) ?? [];
      const parentForChildren: ParentRef = { kind: 'EmailLayout', parentId: 'root' };
      const children = ids
        .map((childId, i) =>
          buildNode(childId, doc, {
            parent: parentForChildren,
            indexInParent: i,
            siblingsCount: ids.length,
          })
        )
        .filter((n): n is OutlineNode => n !== null);
      return {
        id,
        label: t('outline.canvas', 'Canvas'),
        icon: iconForType('EmailLayout'),
        children,
        containerChildrenRef: parentForChildren,
      };
    }
    case 'Container': {
      const ids = (props.childrenIds as string[] | null) ?? [];
      const parentForChildren: ParentRef = { kind: 'Container', parentId: id };
      const children = ids
        .map((childId, i) =>
          buildNode(childId, doc, {
            parent: parentForChildren,
            indexInParent: i,
            siblingsCount: ids.length,
          })
        )
        .filter((n): n is OutlineNode => n !== null);
      const count = children.length;
      return {
        id,
        label: 'Container',
        preview: count === 1 ? '1 child' : `${count} children`,
        icon: iconForType('Container'),
        children,
        containerChildrenRef: parentForChildren,
        ...baseMeta,
      };
    }
    case 'ColumnsContainer': {
      const columns: Array<{ childrenIds?: string[] }> = props.columns ?? [];
      const children: OutlineNode[] = [];
      columns.forEach((col, colIdx) => {
        const colIds = col.childrenIds ?? [];
        const parentForCol: ParentRef = {
          kind: 'ColumnsContainer',
          parentId: id,
          columnIndex: colIdx,
        };
        const colChildren = colIds
          .map((childId, i) =>
            buildNode(childId, doc, {
              parent: parentForCol,
              indexInParent: i,
              siblingsCount: colIds.length,
            })
          )
          .filter((n): n is OutlineNode => n !== null);
        children.push({
          id: `${id}::col${colIdx}`,
          label: `Column ${colIdx + 1}`,
          preview: colChildren.length === 1 ? '1 child' : `${colChildren.length} children`,
          icon: <ViewColumnSharp fontSize="small" sx={{ opacity: 0.6 }} />,
          children: colChildren,
          containerChildrenRef: parentForCol,
        });
      });
      return {
        id,
        label: 'Columns',
        preview: `${columns.length} columns`,
        icon: iconForType('ColumnsContainer'),
        children,
        ...baseMeta,
      };
    }
    case 'Text':
    case 'Heading':
    case 'Button':
      return { id, label: type, preview: previewText(props.text), icon: iconForType(type), ...baseMeta };
    case 'Html':
      return { id, label: 'Html', preview: previewText(props.contents), icon: iconForType('Html'), ...baseMeta };
    case 'Image':
      return {
        id,
        label: 'Image',
        preview: previewText(props.alt) ?? previewText(props.url),
        icon: iconForType('Image'),
        ...baseMeta,
      };
    case 'Avatar':
      return { id, label: 'Avatar', preview: previewText(props.imageUrl), icon: iconForType('Avatar'), ...baseMeta };
    case 'Divider':
      return { id, label: 'Divider', icon: iconForType('Divider'), ...baseMeta };
    case 'Spacer':
      return {
        id,
        label: 'Spacer',
        preview: props.height ? `${props.height}px` : undefined,
        icon: iconForType('Spacer'),
        ...baseMeta,
      };
    case 'Signature':
      return { id, label: 'Signature', preview: previewText(props.name), icon: iconForType('Signature'), ...baseMeta };
    default:
      return { id, label: type, icon: iconForType(type), ...baseMeta };
  }
}

// Drag payload: a JSON string stashed on the DataTransfer so we can tell
// an in-editor block drag from arbitrary external drops.
const DRAG_MIME = 'application/x-email-editor-block';

type DragPayload = {
  sourceId: string;
  sourceParent: ParentRef;
};

type DropPos = 'before' | 'after' | 'inside' | null;

export default function OutlinePanel() {
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const tree = buildNode(ROOT_BLOCK_ID, document);

  const performMove = (
    payload: DragPayload,
    targetParent: ParentRef,
    targetIndex: number
  ) => {
    const patch = buildMovePatch(
      document,
      payload.sourceId,
      payload.sourceParent,
      targetParent,
      targetIndex
    );
    if (patch) {
      setDocument(patch as any);
      setSelectedBlockId(payload.sourceId);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" component="h2" sx={{ fontWeight: 'bold', mb: 0.5, px: 0.5 }}>
        {t('outline.title', 'Outline')}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', px: 0.5, mb: 1 }}>
        {t('outline.hint', 'Click a row to select. Drag a row to reorder or move it into a container.')}
      </Typography>
      {tree ? (
        <OutlineRow
          node={tree}
          depth={0}
          selectedBlockId={selectedBlockId}
          document={document}
          dragging={dragging}
          setDragging={setDragging}
          performMove={performMove}
        />
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
  document: TEditorConfiguration;
  dragging: DragPayload | null;
  setDragging: (p: DragPayload | null) => void;
  performMove: (payload: DragPayload, targetParent: ParentRef, targetIndex: number) => void;
};

function OutlineRow({
  node,
  depth,
  selectedBlockId,
  document,
  dragging,
  setDragging,
  performMove,
}: OutlineRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [dropPos, setDropPos] = useState<DropPos>(null);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isSelectable = !node.id.includes('::');
  const isSelected = isSelectable && selectedBlockId === node.id;

  const canMove =
    isSelectable &&
    node.parent !== undefined &&
    node.indexInParent !== undefined &&
    node.siblingsCount !== undefined;
  const canMoveUp = canMove && (node.indexInParent as number) > 0;
  const canMoveDown = canMove && (node.indexInParent as number) < (node.siblingsCount as number) - 1;

  const isDragSource = dragging?.sourceId === node.id;

  // Block is draggable if it has a parent (so is a real block, not Canvas).
  const draggable = canMove;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggable || !node.parent) return;
    const payload: DragPayload = { sourceId: node.id, sourceParent: node.parent };
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', node.label);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(payload);
  };

  const handleDragEnd = () => setDragging(null);

  // Compute which region of the row the cursor is in: top band, bottom band,
  // or center (valid drop-inside when this row is itself a container).
  const computeDropPos = (e: React.DragEvent<HTMLDivElement>): DropPos => {
    if (!dragging) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height || 28;
    const canDropInside = Boolean(node.containerChildrenRef);
    // Top 25% → before, bottom 25% → after, middle → inside (if container).
    if (canDropInside && y > h * 0.25 && y < h * 0.75) return 'inside';
    if (y < h * 0.5) return 'before';
    return 'after';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!dragging) return;
    // Skip if dropping onto self or into own descendant.
    if (dragging.sourceId === node.id) {
      setDropPos(null);
      return;
    }
    if (node.containerChildrenRef && isDescendant(document, dragging.sourceId, node.id)) {
      setDropPos(null);
      return;
    }
    const pos = computeDropPos(e);
    if (!pos) {
      setDropPos(null);
      return;
    }
    // Reorder requires the target row to have a parent (not the synthetic Canvas root).
    if ((pos === 'before' || pos === 'after') && !node.parent) {
      setDropPos(null);
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropPos(pos);
  };

  const handleDragLeave = () => setDropPos(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!dragging || !dropPos) return;
    e.preventDefault();
    let targetParent: ParentRef | undefined;
    let targetIndex = 0;
    if (dropPos === 'inside' && node.containerChildrenRef) {
      targetParent = node.containerChildrenRef;
      // Append to the end of the container's children. Using Infinity lets
      // buildMovePatch clamp to length regardless of current child count.
      targetIndex = Number.MAX_SAFE_INTEGER;
    } else if ((dropPos === 'before' || dropPos === 'after') && node.parent) {
      targetParent = node.parent;
      targetIndex = (node.indexInParent as number) + (dropPos === 'after' ? 1 : 0);
    }
    if (targetParent) performMove(dragging, targetParent, targetIndex);
    setDropPos(null);
    setDragging(null);
  };

  const handleMove = (delta: -1 | 1) => {
    if (!canMove || !node.parent) return;
    const nextIndex = (node.indexInParent as number) + delta;
    const patch = buildMovePatch(document, node.id, node.parent, node.parent, nextIndex + (delta > 0 ? 1 : 0));
    if (patch) setDocument(patch as any);
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {dropPos === 'before' && <DropLine depth={depth} />}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          draggable={draggable}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => isSelectable && setSelectedBlockId(node.id)}
          onMouseEnter={() => isSelectable && !dragging && setHoveredBlockId(node.id)}
          onMouseLeave={() => isSelectable && setHoveredBlockId(null)}
          sx={{
            pl: `${depth * 12 + 4}px`,
            pr: 0.5,
            py: 0.25,
            minHeight: 28,
            borderRadius: 0.75,
            cursor: isSelectable ? (draggable ? 'grab' : 'pointer') : 'default',
            backgroundColor: isSelected
              ? 'action.selected'
              : dropPos === 'inside'
                ? 'rgba(25, 118, 210, 0.12)'
                : 'transparent',
            opacity: isDragSource ? 0.5 : 1,
            outline:
              dropPos === 'inside'
                ? '1.5px solid rgba(25, 118, 210, 0.7)'
                : undefined,
            transition: 'background-color 80ms, outline-color 80ms',
            '&:hover': {
              backgroundColor: isSelected ? 'action.selected' : 'action.hover',
            },
            '&:hover .outline-move-btns': { opacity: 1 },
            userSelect: 'none',
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: isSelected ? 'primary.main' : 'text.secondary',
              flexShrink: 0,
            }}
          >
            {node.icon}
          </Box>
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
          {canMove && (
            <Box
              className="outline-move-btns"
              sx={{
                display: 'flex',
                ml: 'auto',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 120ms',
              }}
            >
              <Tooltip title="Move up">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canMoveUp}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(-1);
                    }}
                    aria-label={`Move ${node.label} up`}
                    sx={{ p: 0.25 }}
                  >
                    <KeyboardArrowUp fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canMoveDown}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(1);
                    }}
                    aria-label={`Move ${node.label} down`}
                    sx={{ p: 0.25 }}
                  >
                    <KeyboardArrowDown fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Stack>
        {dropPos === 'after' && <DropLine depth={depth} />}
      </Box>
      {hasChildren && expanded && (
        <Box>
          {node.children!.map((child) => (
            <OutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedBlockId={selectedBlockId}
              document={document}
              dragging={dragging}
              setDragging={setDragging}
              performMove={performMove}
            />
          ))}
        </Box>
      )}
    </>
  );
}

function DropLine({ depth }: { depth: number }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: `${depth * 12 + 24}px`,
          right: 4,
          top: -1,
          height: 2,
          backgroundColor: 'primary.main',
          borderRadius: 1,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
