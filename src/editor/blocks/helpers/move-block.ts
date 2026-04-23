import { TEditorConfiguration } from '@editor/core';

/**
 * A block's position in the document tree is described by a pointer to its
 * parent plus, when the parent is a `ColumnsContainer`, which column it lives
 * in. `EmailLayout` / `Container` children are a single flat array; columns
 * split it per index.
 */
export type ParentRef =
  | { kind: 'EmailLayout'; parentId: 'root' }
  | { kind: 'Container'; parentId: string }
  | { kind: 'ColumnsContainer'; parentId: string; columnIndex: number };

export function sameParent(a: ParentRef, b: ParentRef): boolean {
  if (a.kind !== b.kind || a.parentId !== b.parentId) return false;
  if (a.kind === 'ColumnsContainer' && b.kind === 'ColumnsContainer') {
    return a.columnIndex === b.columnIndex;
  }
  return true;
}

function getChildrenIds(doc: TEditorConfiguration, ref: ParentRef): string[] {
  const block: any = doc[ref.parentId];
  if (!block) return [];
  if (ref.kind === 'EmailLayout') return (block.data?.childrenIds ?? []) as string[];
  if (ref.kind === 'Container') return (block.data?.props?.childrenIds ?? []) as string[];
  const col = block.data?.props?.columns?.[ref.columnIndex];
  return (col?.childrenIds ?? []) as string[];
}

function patchChildrenIds(block: any, ref: ParentRef, newIds: string[]): any {
  if (ref.kind === 'EmailLayout') {
    return { ...block, data: { ...block.data, childrenIds: newIds } };
  }
  if (ref.kind === 'Container') {
    return {
      ...block,
      data: { ...block.data, props: { ...block.data.props, childrenIds: newIds } },
    };
  }
  const columns = (block.data?.props?.columns ?? []).map((c: any, i: number) =>
    i === ref.columnIndex ? { ...c, childrenIds: newIds } : c
  );
  return { ...block, data: { ...block.data, props: { ...block.data.props, columns } } };
}

/**
 * True if `candidateId` lives anywhere inside the subtree rooted at
 * `ancestorId` (including `ancestorId` itself). Used to reject drops that
 * would move a container into one of its own descendants.
 */
export function isDescendant(
  doc: TEditorConfiguration,
  ancestorId: string,
  candidateId: string
): boolean {
  if (ancestorId === candidateId) return true;
  const block: any = doc[ancestorId];
  if (!block) return false;
  const direct: string[] = [];
  if (block.type === 'EmailLayout') direct.push(...(block.data?.childrenIds ?? []));
  if (block.type === 'Container') direct.push(...(block.data?.props?.childrenIds ?? []));
  if (block.type === 'ColumnsContainer') {
    for (const col of block.data?.props?.columns ?? []) {
      direct.push(...(col.childrenIds ?? []));
    }
  }
  for (const childId of direct) {
    if (isDescendant(doc, childId, candidateId)) return true;
  }
  return false;
}

/**
 * Compute the partial-document patch that moves `sourceId` from
 * `sourceParent` to `targetParent` at `targetIndex`. Returns `null` when the
 * move is a no-op (same position) or disallowed (dropping into self / own
 * descendant). Caller feeds the patch to `setDocument`.
 */
export function buildMovePatch(
  doc: TEditorConfiguration,
  sourceId: string,
  sourceParent: ParentRef,
  targetParent: ParentRef,
  targetIndex: number
): Partial<TEditorConfiguration> | null {
  // Can't drop a block into its own subtree.
  if (isDescendant(doc, sourceId, targetParent.parentId)) return null;

  const srcIds = getChildrenIds(doc, sourceParent);
  const sourceIndex = srcIds.indexOf(sourceId);
  if (sourceIndex < 0) return null;

  if (sameParent(sourceParent, targetParent)) {
    // Single-array reorder — adjust targetIndex for the removal when the
    // insertion point is after the source.
    const arr = [...srcIds];
    arr.splice(sourceIndex, 1);
    let insertAt = targetIndex;
    if (insertAt > sourceIndex) insertAt -= 1;
    if (insertAt < 0) insertAt = 0;
    if (insertAt > arr.length) insertAt = arr.length;
    arr.splice(insertAt, 0, sourceId);
    if (arr.every((id, i) => id === srcIds[i])) return null;
    const sourceBlock: any = doc[sourceParent.parentId];
    return {
      [sourceParent.parentId]: patchChildrenIds(sourceBlock, sourceParent, arr),
    } as any;
  }

  // Cross-parent move: remove from source, insert into target.
  const newSrcIds = [...srcIds];
  newSrcIds.splice(sourceIndex, 1);
  const tgtIds = getChildrenIds(doc, targetParent);
  const newTgtIds = [...tgtIds];
  let insertAt = targetIndex;
  if (insertAt < 0) insertAt = 0;
  if (insertAt > newTgtIds.length) insertAt = newTgtIds.length;
  newTgtIds.splice(insertAt, 0, sourceId);

  // Same parent block, different columns (both refs are ColumnsContainer on
  // the same id). Collapse both column edits into one block patch.
  if (sourceParent.parentId === targetParent.parentId) {
    const block: any = doc[sourceParent.parentId];
    const columns = (block.data?.props?.columns ?? []).map((c: any, i: number) => {
      if (sourceParent.kind === 'ColumnsContainer' && i === sourceParent.columnIndex) {
        return { ...c, childrenIds: newSrcIds };
      }
      if (targetParent.kind === 'ColumnsContainer' && i === targetParent.columnIndex) {
        return { ...c, childrenIds: newTgtIds };
      }
      return c;
    });
    return {
      [sourceParent.parentId]: {
        ...block,
        data: { ...block.data, props: { ...block.data.props, columns } },
      },
    } as any;
  }

  const sourceBlock: any = doc[sourceParent.parentId];
  const targetBlock: any = doc[targetParent.parentId];
  return {
    [sourceParent.parentId]: patchChildrenIds(sourceBlock, sourceParent, newSrcIds),
    [targetParent.parentId]: patchChildrenIds(targetBlock, targetParent, newTgtIds),
  } as any;
}
