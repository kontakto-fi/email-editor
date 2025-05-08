import React from 'react';

// Import from our local blocks
import { ColumnsContainer as BaseColumnsContainer } from '@blocks';

import { ReaderBlock } from '../../reader/core';

import { ColumnsContainerProps } from './columns-container-props-schema';

/**
 * ColumnsContainer Reader component for email templates
 * 
 * This component extends the base ColumnsContainer to support
 * referencing child blocks by ID rather than direct embedding,
 * allowing for a more flexible document structure.
 */
export default function ColumnsContainerReader({ style, props }: ColumnsContainerProps) {
  const { columns, ...restProps } = props ?? {};
  let cols = undefined;
  if (columns) {
    cols = columns.map((col) => col.childrenIds.map((childId) => <ReaderBlock key={childId} id={childId} />));
  }

  return <BaseColumnsContainer props={restProps} columns={cols} style={style} />;
} 