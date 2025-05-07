import React, { CSSProperties } from 'react';
import { z } from 'zod';

export const SpacerPropsSchema = z.object({
  props: z
    .object({
      height: z.number().gte(0).optional().nullish(),
    })
    .optional()
    .nullable(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;

// Export for runtime usage
export const SpacerProps = SpacerPropsSchema;

export const SpacerPropsDefaults = {
  height: 16,
};

export function Spacer({ props }: SpacerProps) {
  const style: CSSProperties = {
    height: props?.height ?? SpacerPropsDefaults.height,
  };
  return <div style={style} />;
}

export default Spacer;
