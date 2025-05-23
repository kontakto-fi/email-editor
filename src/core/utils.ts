import { z } from 'zod';

export type BaseZodDictionary = { [name: string]: z.AnyZodObject };
export type DocumentBlocksDictionary<T extends BaseZodDictionary> = {
  [K in keyof T]: {
    schema: T[K];
    Component: (props: z.infer<T[K]>) => JSX.Element;
  };
};

// Export as a runtime value
export const DocumentBlocksDictionary = 'DocumentBlocksDictionary';

export type BlockConfiguration<T extends BaseZodDictionary> = {
  [TType in keyof T]: {
    type: TType;
    data: z.infer<T[TType]>;
  };
}[keyof T];

// Export as a runtime value
export const BlockConfiguration = 'BlockConfiguration';

// Export BaseZodDictionary as a runtime value
export const BaseZodDictionary = 'BaseZodDictionary';

export class BlockNotFoundError extends Error {
  blockId: string;
  constructor(blockId: string) {
    super('Could not find a block with the given blockId');
    this.blockId = blockId;
  }
}
