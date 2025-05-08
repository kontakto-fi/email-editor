// Export components from editor
export { editorVersion } from './editor';

// Export blocks
export { 
  // From text
  Text,
  TextPropsSchema,
  TextProps,
  TextPropsDefaults,
  EmailMarkdown,
  
  // From avatar
  Avatar,
  AvatarPropsSchema,
  AvatarProps,
  AvatarPropsDefaults,
  
  // From button
  Button,
  ButtonPropsSchema,
  ButtonProps,
  ButtonPropsDefaults,
  
  // From columns-container
  ColumnsContainer,
  ColumnsContainerPropsSchema,
  ColumnsContainerProps,
  
  // From container
  Container,
  ContainerPropsSchema,
  ContainerProps,
  
  // From divider
  Divider,
  DividerPropsSchema,
  DividerProps,
  DividerPropsDefaults,
  
  // From heading
  Heading,
  HeadingPropsSchema,
  HeadingProps,
  HeadingPropsDefaults,
  
  // From html
  Html,
  HtmlPropsSchema,
  HtmlProps,
  
  // From image
  Image,
  ImagePropsSchema,
  ImageProps,
  
  // From spacer
  Spacer,
  SpacerPropsSchema,
  SpacerProps,
  SpacerPropsDefaults
} from './blocks/index';

// Export core functionality
export {
  // Builders
  buildBlockComponent,
  buildBlockConfigurationSchema,
  buildBlockConfigurationDictionary,
  
  // Utility types
  BlockConfiguration, 
  DocumentBlocksDictionary
} from './core/index';

// Export email-builder
export {
  renderToStaticMarkup,
  Reader,
  ReaderBlock,
  ReaderBlockSchema,
  ReaderDocumentSchema,
  
  // Specialized blocks from email-builder
  ColumnsContainerReader,
  ContainerReader,
  EmailLayoutPropsSchema,
  EmailLayoutReader,
  
  // Types
  type TReaderBlock,
  type TReaderBlockProps,
  type TReaderDocument,
  type TReaderProps
} from './email-builder';

// Export theme
export { default as theme } from './theme';

// Export the new EmailEditor with its API
export {
  EmailEditor,
  EmailEditorProvider,
  useEmailEditor,
  type EmailEditorProps,
  type EmailEditorRef,
  type EmailEditorContextType,
  type EmailEditorProviderProps
} from './email-editor'; 