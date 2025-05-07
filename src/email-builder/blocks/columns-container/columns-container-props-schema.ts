import { z } from 'zod';

// Import from our local blocks
import { ColumnsContainerPropsSchema as BaseColumnsContainerPropsSchema } from '../../../blocks/columns-container';

/**
 * Schema for ColumnsContainer props in the email editor
 * 
 * Extends the base ColumnsContainer schema to add support for 
 * childrenIds references that allow adding other blocks into columns
 */
const BasePropsShape = BaseColumnsContainerPropsSchema.shape.props.unwrap().unwrap().shape;

const ColumnsContainerPropsSchema = z.object({
  style: BaseColumnsContainerPropsSchema.shape.style,
  props: z
    .object({
      ...BasePropsShape,
      columns: z.tuple([
        z.object({ childrenIds: z.array(z.string()) }),
        z.object({ childrenIds: z.array(z.string()) }),
        z.object({ childrenIds: z.array(z.string()) }),
      ]),
    })
    .optional()
    .nullable(),
});

export default ColumnsContainerPropsSchema;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema>; 