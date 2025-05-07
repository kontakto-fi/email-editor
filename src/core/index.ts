// This file will export core functionality
// We'll populate this as we move the document-core functionality from the old structure 

// Export builder functions
export { default as buildBlockComponent } from './builders/build-block-component';
export { default as buildBlockConfigurationSchema } from './builders/build-block-configuration-schema';
export { default as buildBlockConfigurationDictionary } from './builders/build-block-configuration-dictionary';

// Export utility types
export { BlockConfiguration, DocumentBlocksDictionary } from './utils'; 