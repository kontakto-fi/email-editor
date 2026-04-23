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

const ROOT_BLOCK_ID = 'root';
const PREVIEW_MAX = 36;

type ParentRef =
  | { kind: 'EmailLayout'; parentId: 'root' }
  | { kind: 'Container'; parentId: string }
  | { kind: 'ColumnsContainer'; parentId: string; columnIndex: number };

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
      const children = ids
        .map((childId, i) =>
          buildNode(childId, doc, {
            parent: { kind: 'EmailLayout', parentId: 'root' },
            indexInParent: i,
            siblingsCount: ids.length,
          })
        )
        .filter((n): n is OutlineNode => n !== null);
      return { id, label: 'Canvas', icon: iconForType('EmailLayout'), children };
    }
    case 'Container': {
      const ids = (props.childrenIds as string[] | null) ?? [];
      const children = ids
        .map((childId, i) =>
          buildNode(childId, doc, {
            parent: { kind: 'Container', parentId: id },
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
        ...baseMeta,
      };
    }
    case 'ColumnsContainer': {
      const columns: Array<{ childrenIds?: string[] }> = props.columns ?? [];
      const children: OutlineNode[] = [];
      columns.forEach((col, colIdx) => {
        const colIds = col.childrenIds ?? [];
        const colChildren = colIds
          .map((childId, i) =>
            buildNode(childId, doc, {
              parent: { kind: 'ColumnsContainer', parentId: id, columnIndex: colIdx },
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

/**
 * Build the partial-document patch that reorders `blockId` within its parent's
 * children by the given delta (+1 = down, -1 = up). No-op if the move would
 * cross the ends of the list.
 */
function moveWithinParent(
  doc: TEditorConfiguration,
  parent: ParentRef,
  indexInParent: number,
  delta: -1 | 1
): Partial<TEditorConfiguration> | null {
  const nextIndex = indexInParent + delta;
  if (parent.kind === 'EmailLayout') {
    const root: any = doc.root;
    const ids = [...((root?.data?.childrenIds as string[] | null) ?? [])];
    if (nextIndex < 0 || nextIndex >= ids.length) return null;
    [ids[indexInParent], ids[nextIndex]] = [ids[nextIndex], ids[indexInParent]];
    return { root: { ...root, data: { ...root.data, childrenIds: ids } } } as any;
  }
  if (parent.kind === 'Container') {
    const block: any = doc[parent.parentId];
    if (!block) return null;
    const ids = [...((block.data?.props?.childrenIds as string[] | null) ?? [])];
    if (nextIndex < 0 || nextIndex >= ids.length) return null;
    [ids[indexInParent], ids[nextIndex]] = [ids[nextIndex], ids[indexInParent]];
    return {
      [parent.parentId]: {
        ...block,
        data: { ...block.data, props: { ...block.data.props, childrenIds: ids } },
      },
    } as any;
  }
  // ColumnsContainer
  const block: any = doc[parent.parentId];
  if (!block) return null;
  const columns: Array<{ childrenIds?: string[] }> = block.data?.props?.columns ?? [];
  const col = columns[parent.columnIndex];
  if (!col) return null;
  const ids = [...(col.childrenIds ?? [])];
  if (nextIndex < 0 || nextIndex >= ids.length) return null;
  [ids[indexInParent], ids[nextIndex]] = [ids[nextIndex], ids[indexInParent]];
  const nextColumns = columns.map((c, i) => (i === parent.columnIndex ? { ...c, childrenIds: ids } : c));
  return {
    [parent.parentId]: {
      ...block,
      data: { ...block.data, props: { ...block.data.props, columns: nextColumns } },
    },
  } as any;
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
        Click a row to select. Hover to highlight on the canvas. Use ↑↓ to reorder within a parent.
      </Typography>
      {tree ? (
        <OutlineRow node={tree} depth={0} selectedBlockId={selectedBlockId} document={document} />
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
};

function OutlineRow({ node, depth, selectedBlockId, document }: OutlineRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  // Synthetic ids like "<id>::col0" aren't real blocks and shouldn't be selectable or movable.
  const isSelectable = !node.id.includes('::');
  const isSelected = isSelectable && selectedBlockId === node.id;

  const canMove =
    isSelectable &&
    node.parent !== undefined &&
    node.indexInParent !== undefined &&
    node.siblingsCount !== undefined;
  const canMoveUp = canMove && (node.indexInParent as number) > 0;
  const canMoveDown = canMove && (node.indexInParent as number) < (node.siblingsCount as number) - 1;

  const handleMove = (delta: -1 | 1) => {
    if (!canMove) return;
    const patch = moveWithinParent(document, node.parent!, node.indexInParent!, delta);
    if (patch) setDocument(patch as any);
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={() => isSelectable && setSelectedBlockId(node.id)}
        onMouseEnter={() => isSelectable && setHoveredBlockId(node.id)}
        onMouseLeave={() => isSelectable && setHoveredBlockId(null)}
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
          '&:hover .outline-move-btns': { opacity: 1 },
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
      {hasChildren && expanded && (
        <Box>
          {node.children!.map((child) => (
            <OutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedBlockId={selectedBlockId}
              document={document}
            />
          ))}
        </Box>
      )}
    </>
  );
}
