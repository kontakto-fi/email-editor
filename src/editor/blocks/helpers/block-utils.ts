import { TEditorBlock } from '@editor/core';

export function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function rekeyBlocks(
  blocks: Record<string, any>,
  rootBlockId: string
): { blocks: Record<string, any>; newRootId: string } {
  const idMap: Record<string, string> = {};
  for (const oldId of Object.keys(blocks)) {
    idMap[oldId] = generateId();
  }

  const remapIds = (ids: string[] | null | undefined) => ids?.map((id) => idMap[id] ?? id);

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

export function collectBlock(blockId: string, document: Record<string, any>): Record<string, any> {
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
