import React, { useCallback, useEffect } from 'react';

import { useCurrentBlockId } from '@editor/editor-block';
import { replaceDocument, setDocument, setSelectedBlockId, useDocument, useSelectedBlockId } from '@editor/editor-context';
import { TEditorBlock } from '@editor/core';
import EditorChildrenIds from '@editor/blocks/helpers/editor-children-ids';

import { EmailLayoutProps } from './email-layout-props-schema';

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function rekeyBlocks(blocks: Record<string, any>, rootBlockId: string): { blocks: Record<string, any>; newRootId: string } {
  const idMap: Record<string, string> = {};
  for (const oldId of Object.keys(blocks)) {
    idMap[oldId] = generateId();
  }

  const remapIds = (ids: string[] | null | undefined) =>
    ids?.map((id) => idMap[id] ?? id);

  const newBlocks: Record<string, any> = {};
  for (const [oldId, block] of Object.entries(blocks)) {
    const b = block as TEditorBlock;
    const newId = idMap[oldId];
    if (b.type === 'Container') {
      newBlocks[newId] = {
        ...b,
        data: {
          ...b.data,
          props: { ...b.data.props, childrenIds: remapIds(b.data.props?.childrenIds) },
        },
      };
    } else if (b.type === 'ColumnsContainer') {
      newBlocks[newId] = {
        ...b,
        data: {
          ...b.data,
          props: {
            ...b.data.props,
            columns: b.data.props?.columns?.map((c: any) => ({
              ...c,
              childrenIds: remapIds(c.childrenIds),
            })),
          },
        },
      };
    } else {
      newBlocks[newId] = b;
    }
  }
  return { blocks: newBlocks, newRootId: idMap[rootBlockId] };
}

function collectBlock(blockId: string, document: Record<string, any>): Record<string, any> {
  const block = document[blockId] as TEditorBlock;
  if (!block) return {};
  const result: Record<string, any> = { [blockId]: block };
  if (block.type === 'Container') {
    for (const childId of block.data.props?.childrenIds ?? []) {
      Object.assign(result, collectBlock(childId, document));
    }
  }
  if (block.type === 'ColumnsContainer') {
    for (const col of block.data.props?.columns ?? []) {
      for (const childId of col.childrenIds ?? []) {
        Object.assign(result, collectBlock(childId, document));
      }
    }
  }
  return result;
}

function getFontFamily(fontFamily: EmailLayoutProps['fontFamily']) {
  const f = fontFamily ?? 'MODERN_SANS';
  switch (f) {
    case 'MODERN_SANS':
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case 'BOOK_SANS':
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case 'ORGANIC_SANS':
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case 'GEOMETRIC_SANS':
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case 'HEAVY_SANS':
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case 'ROUNDED_SANS':
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case 'MODERN_SERIF':
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case 'BOOK_SERIF':
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case 'MONOSPACE':
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
}

export default function EmailLayoutEditor(props: EmailLayoutProps) {
  const childrenIds = props.childrenIds ?? [];
  const document = useDocument();
  const currentBlockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();

  const handleDelete = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    if (!selectedBlockId) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    e.preventDefault();

    const filterChildrenIds = (ids: string[] | null | undefined) =>
      ids?.filter((id) => id !== selectedBlockId);

    const nDocument: Record<string, any> = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === selectedBlockId) continue;
      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = { ...block, data: { ...block.data, childrenIds: filterChildrenIds(block.data.childrenIds) } };
          break;
        case 'Container':
          nDocument[id] = { ...block, data: { ...block.data, props: { ...block.data.props, childrenIds: filterChildrenIds(block.data.props?.childrenIds) } } };
          break;
        case 'ColumnsContainer':
          nDocument[id] = { ...block, data: { ...block.data, props: { ...block.data.props, columns: block.data.props?.columns?.map((c: any) => ({ ...c, childrenIds: filterChildrenIds(c.childrenIds) })) } } };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[selectedBlockId];
    replaceDocument(nDocument as any);
  }, [selectedBlockId, document]);

  const handleCopy = useCallback((e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey) || e.key !== 'c') return;
    if (!selectedBlockId) return;

    // Don't intercept when typing in an input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const blocks = collectBlock(selectedBlockId, document);
    if (Object.keys(blocks).length === 0) return;

    e.preventDefault();
    const payload = JSON.stringify({ __emailEditorBlocks: true, rootBlockId: selectedBlockId, blocks });
    navigator.clipboard.writeText(payload);
  }, [selectedBlockId, document]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    // Don't intercept paste when typing in an input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    if (!parsed?.__emailEditorBlocks || !parsed.rootBlockId || !parsed.blocks) return;

    e.preventDefault();

    const { blocks: newBlocks, newRootId } = rekeyBlocks(parsed.blocks, parsed.rootBlockId);
    const doc = { ...document };

    // Add all new blocks to the document
    Object.assign(doc, newBlocks);

    // Insert after selected block, or append to end
    const currentChildrenIds = [...(childrenIds || [])];
    const insertIndex = selectedBlockId ? currentChildrenIds.indexOf(selectedBlockId) + 1 : currentChildrenIds.length;
    currentChildrenIds.splice(insertIndex, 0, newRootId);

    doc[currentBlockId] = {
      type: 'EmailLayout',
      data: {
        ...document[currentBlockId].data,
        childrenIds: currentChildrenIds,
      },
    };

    replaceDocument(doc);
    setSelectedBlockId(newRootId);
  }, [document, childrenIds, selectedBlockId, currentBlockId]);

  useEffect(() => {
    window.addEventListener('keydown', handleDelete);
    window.addEventListener('keydown', handleCopy);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleDelete);
      window.removeEventListener('keydown', handleCopy);
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleDelete, handleCopy, handlePaste]);

  const baseStyle: React.CSSProperties = {
    color: props.textColor ?? '#262626',
    fontFamily: getFontFamily(props.fontFamily),
    fontSize: '16px',
    fontWeight: '400',
    letterSpacing: '0.15008px',
    lineHeight: '1.5',
    margin: '0',
  };

  const editorChildren = (
    <EditorChildrenIds
      childrenIds={childrenIds}
      parentRef={{ kind: 'EmailLayout', parentId: 'root' }}
      onChange={({ block, blockId, childrenIds }) => {
        setDocument({
          [blockId]: block,
          [currentBlockId]: {
            type: 'EmailLayout',
            data: {
              ...document[currentBlockId].data,
              childrenIds: childrenIds,
            },
          },
        });
        setSelectedBlockId(blockId);
      }}
    />
  );

  // Editor-only chrome: a muted workspace around the email, so the 600-px
  // canvas reads as a bounded document on wide screens. None of this ships
  // with the rendered email — EmailLayoutReader is unchanged.
  const WORKSPACE_BG = '#e7e8ec';
  const CARD_MAX_WIDTH = 664; // 600 canvas + 32px horizontal padding
  // Note: no `overflow: hidden` on the card — the per-block TuneMenu renders
  // icon controls that sit slightly outside the block's rectangle, and clipping
  // them here would hide the move-up/down/copy/delete affordances.
  const cardStyle: React.CSSProperties = {
    maxWidth: CARD_MAX_WIDTH,
    margin: '0 auto',
    borderRadius: 12,
    boxShadow: '0 1px 2px rgba(33, 36, 67, 0.05), 0 8px 24px rgba(33, 36, 67, 0.08)',
  };

  if (props.backdropDisabled) {
    return (
      <div
        onClick={() => {
          setSelectedBlockId(null);
        }}
        style={{
          ...baseStyle,
          backgroundColor: WORKSPACE_BG,
          padding: '32px',
          width: '100%',
          minHeight: '100%',
        }}
      >
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#F5F5F5',
            padding: '32px',
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>{editorChildren}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setSelectedBlockId(null);
      }}
      style={{
        ...baseStyle,
        backgroundColor: WORKSPACE_BG,
        padding: '32px 16px',
        width: '100%',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          ...cardStyle,
          backgroundColor: props.backdropColor ?? '#F5F5F5',
          padding: '32px 0',
        }}
      >
        <table
          align="center"
          width="100%"
          style={{
            margin: '0 auto',
            maxWidth: '600px',
            backgroundColor: props.canvasColor ?? '#FFFFFF',
            borderRadius: props.borderRadius ?? undefined,
            overflow: props.borderRadius ? 'hidden' : undefined,
            border: (() => {
              const v = props.borderColor;
              if (!v) {
                return undefined;
              }
              return `1px solid ${v}`;
            })(),
          }}
          role="presentation"
          cellSpacing="0"
          cellPadding="0"
          border={0}
        >
          <tbody>
            <tr style={{ width: '100%' }}>
              <td>{editorChildren}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
