// Export renderer
export { renderToStaticMarkup, renderToText } from './renderers';

// Export Reader and related types
export {
  Reader,
  ReaderBlock,
  ReaderBlockSchema,
  ReaderDocumentSchema,
  type TReaderBlock,
  type TReaderBlockProps,
  type TReaderDocument,
  type TReaderProps
} from './reader';

// Export specialized blocks
export {
  ColumnsContainerPropsSchema,
  ColumnsContainerReader,
  ContainerPropsSchema,
  ContainerReader,
  EmailLayoutPropsSchema,
  EmailLayoutReader,
  TemplateVariableSchema
} from './blocks';

// Export Handlebars helpers for consumers who want to render outside the save flow
export { editorHandlebars, evaluateHandlebars, type HandlebarsContext } from './handlebars';
