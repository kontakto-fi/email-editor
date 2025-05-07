import React from 'react';

// Import from our local blocks
import { Container as BaseContainer } from '../../../blocks/container';

import { ReaderBlock } from '../../reader/core';

import { ContainerProps } from './container-props-schema';

/**
 * Container Reader component for email templates
 * 
 * This component extends the base Container to support
 * referencing child blocks by ID rather than direct embedding,
 * allowing for a more flexible document structure.
 */
export default function ContainerReader({ style, props }: ContainerProps) {
  const childrenIds = props?.childrenIds ?? [];
  return (
    <BaseContainer style={style}>
      {childrenIds.map((childId) => (
        <ReaderBlock key={childId} id={childId} />
      ))}
    </BaseContainer>
  );
} 