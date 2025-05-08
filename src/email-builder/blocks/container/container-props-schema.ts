import { z } from 'zod';

// Import from our local blocks
import { ContainerPropsSchema as BaseContainerPropsSchema } from '@blocks';

/**
 * Schema for Container props in the email editor
 * 
 * Extends the base Container schema to add support for
 * childrenIds references that allow adding other blocks inside
 */
export const ContainerPropsSchema = z.object({
  style: BaseContainerPropsSchema.shape.style,
  props: z
    .object({
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ContainerProps = z.infer<typeof ContainerPropsSchema>; 