import React from 'react';

import { ArrowDownwardOutlined, ArrowUpwardOutlined, ContentCopyOutlined, DeleteOutlined } from '@mui/icons-material';
import { IconButton, Paper, Stack, SxProps, Tooltip } from '@mui/material';

import { TEditorBlock } from '@editor/core';
import { resetDocument, setSelectedBlockId, useDocument } from '@editor/editor-context';
import { ColumnsContainerProps } from '@editor/blocks/columns-container/columns-container-props-schema';
import { t } from '@i18n';

const sx: SxProps = {
  position: 'absolute',
  top: 0,
  left: -56,
  borderRadius: 64,
  paddingX: 0.5,
  paddingY: 1,
  zIndex: 'fab',
};

function collectBlock(blockId: string, document: Record<string, any>): Record<string, any> {
  const block = document[blockId] as TEditorBlock;
  if (!block) return {};
  const result: Record<string, any> = { [blockId]: block };

  // Collect children from Container
  if (block.type === 'Container') {
    const childrenIds = block.data.props?.childrenIds ?? [];
    for (const childId of childrenIds) {
      Object.assign(result, collectBlock(childId, document));
    }
  }
  // Collect children from ColumnsContainer
  if (block.type === 'ColumnsContainer') {
    const columns = block.data.props?.columns ?? [];
    for (const col of columns) {
      for (const childId of col.childrenIds ?? []) {
        Object.assign(result, collectBlock(childId, document));
      }
    }
  }
  // Collect children from EmailLayout
  if (block.type === 'EmailLayout') {
    const childrenIds = block.data.childrenIds ?? [];
    for (const childId of childrenIds) {
      Object.assign(result, collectBlock(childId, document));
    }
  }
  return result;
}

type Props = {
  blockId: string;
};
export default function TuneMenu({ blockId }: Props) {
  const document = useDocument();

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds;
      }
      return childrenIds.filter((f) => f !== blockId);
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: filterChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: filterChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[blockId];
    resetDocument(nDocument);
  };

  const handleCopyClick = () => {
    const blocks = collectBlock(blockId, document);
    const payload = JSON.stringify({ __emailEditorBlocks: true, rootBlockId: blockId, blocks });
    navigator.clipboard.writeText(payload);
  };

  const handleMoveClick = (direction: 'up' | 'down') => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids;
      }
      const index = ids.indexOf(blockId);
      if (index < 0) {
        return ids;
      }
      const childrenIds = [...ids];
      if (direction === 'up' && index > 0) {
        [childrenIds[index], childrenIds[index - 1]] = [childrenIds[index - 1], childrenIds[index]];
      } else if (direction === 'down' && index < childrenIds.length - 1) {
        [childrenIds[index], childrenIds[index + 1]] = [childrenIds[index + 1], childrenIds[index]];
      }
      return childrenIds;
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: moveChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }

    resetDocument(nDocument);
    setSelectedBlockId(blockId);
  };

  return (
    <Paper sx={sx} onClick={(ev) => ev.stopPropagation()}>
      <Stack>
        <Tooltip title={t('tune.move-up', 'Move up')} placement="left-start">
          <IconButton aria-label={t('tune.move-up', 'Move up')} onClick={() => handleMoveClick('up')} sx={{ color: 'text.primary' }}>
            <ArrowUpwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('tune.move-down', 'Move down')} placement="left-start">
          <IconButton aria-label={t('tune.move-down', 'Move down')} onClick={() => handleMoveClick('down')} sx={{ color: 'text.primary' }}>
            <ArrowDownwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('tune.copy', 'Copy block')} placement="left-start">
          <IconButton aria-label={t('tune.copy', 'Copy block')} onClick={handleCopyClick} sx={{ color: 'text.primary' }}>
            <ContentCopyOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('tune.delete', 'Delete')} placement="left-start">
          <IconButton aria-label={t('tune.delete', 'Delete')} onClick={handleDeleteClick} sx={{ color: 'text.primary' }}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
