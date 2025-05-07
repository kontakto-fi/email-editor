import React, { createContext, useContext } from 'react';
import { z } from 'zod';

// Import directly from our local blocks
import { 
  Avatar, AvatarPropsSchema,
  Button, ButtonPropsSchema,
  Divider, DividerPropsSchema,
  Heading, HeadingPropsSchema,
  Html, HtmlPropsSchema,
  Image, ImagePropsSchema,
  Spacer, SpacerPropsSchema,
  Text, TextPropsSchema
} from '../../blocks';

// Import from our local core
import {
  buildBlockComponent,
  buildBlockConfigurationDictionary,
  buildBlockConfigurationSchema,
} from '../../core';

// Import the local block components using the new index files
import {
  ColumnsContainerPropsSchema,
  ColumnsContainerReader,
  ContainerPropsSchema,
  ContainerReader,
  EmailLayoutPropsSchema,
  EmailLayoutReader
} from '../blocks';

/**
 * Reader component - responsible for rendering an email document
 * 
 * This component provides a context for rendering a document composed of various blocks.
 * It uses a dictionary of block components and their schemas to validate and render
 * the document structure.
 */

// Define the context and reader document type first to avoid circular references
export type TReaderDocument = Record<string, any>;
const ReaderContext = createContext<TReaderDocument>({});

function useReaderDocument() {
  return useContext(ReaderContext);
}

// Create a temporary ReaderBlock component to define in the dictionary
export type TReaderBlockProps = { id: string };
export function ReaderBlock({ id }: TReaderBlockProps) {
  const document = useReaderDocument();
  return document[id] ? <BaseReaderBlock {...document[id]} /> : null;
}

// Now define the dictionary with all block components
const READER_DICTIONARY = buildBlockConfigurationDictionary({
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Component: ColumnsContainerReader,
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader,
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader,
  },
  //
  Avatar: {
    schema: AvatarPropsSchema,
    Component: Avatar,
  },
  Button: {
    schema: ButtonPropsSchema,
    Component: Button,
  },
  Divider: {
    schema: DividerPropsSchema,
    Component: Divider,
  },
  Heading: {
    schema: HeadingPropsSchema,
    Component: Heading,
  },
  Html: {
    schema: HtmlPropsSchema,
    Component: Html,
  },
  Image: {
    schema: ImagePropsSchema,
    Component: Image,
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Component: Spacer,
  },
  Text: {
    schema: TextPropsSchema,
    Component: Text,
  },
});

export const ReaderBlockSchema = buildBlockConfigurationSchema(READER_DICTIONARY);
export type TReaderBlock = z.infer<typeof ReaderBlockSchema>;

export const ReaderDocumentSchema = z.record(z.string(), ReaderBlockSchema);

// Now define the BaseReaderBlock using the dictionary
const BaseReaderBlock = buildBlockComponent(READER_DICTIONARY);

export type TReaderProps = {
  document: Record<string, z.infer<typeof ReaderBlockSchema>>;
  rootBlockId: string;
};
export default function Reader({ document, rootBlockId }: TReaderProps) {
  return (
    <ReaderContext.Provider value={document}>
      <ReaderBlock id={rootBlockId} />
    </ReaderContext.Provider>
  );
} 