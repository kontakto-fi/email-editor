// Export components
export * from './editor';

// Export blocks
// Resolve ambiguous exports by explicitly naming them
export * from './blocks/index';

// Export core functionality
export * from './core/index';

// Export email-builder
// Make sure to avoid name collisions with the blocks export
export {
  renderToStaticMarkup,
  Reader,
  ReaderBlock,
  ReaderBlockSchema,
  ReaderDocumentSchema,
  type TReaderBlock,
  type TReaderBlockProps,
  type TReaderDocument,
  type TReaderProps,
  EmailLayoutPropsSchema,
  EmailLayoutReader
} from './email-builder';

// Export App component
export { default as App } from './app';

// Export theme
export { default as theme } from './theme'; 