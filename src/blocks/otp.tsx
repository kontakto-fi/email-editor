import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

const FONT_FAMILY_SCHEMA = z
  .enum([
    'MODERN_SANS',
    'BOOK_SANS',
    'ORGANIC_SANS',
    'GEOMETRIC_SANS',
    'HEAVY_SANS',
    'ROUNDED_SANS',
    'MODERN_SERIF',
    'BOOK_SERIF',
    'MONOSPACE',
  ])
  .nullable()
  .optional();

function getFontFamily(fontFamily: z.infer<typeof FONT_FAMILY_SCHEMA>) {
  switch (fontFamily) {
    case 'MODERN_SANS':
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case 'BOOK_SANS':
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case 'ORGANIC_SANS':
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case 'GEOMETRIC_SANS':
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case 'HEAVY_SANS':
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case 'ROUNDED_SANS':
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case 'MODERN_SERIF':
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case 'BOOK_SERIF':
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case 'MONOSPACE':
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
  return undefined;
}

export const OtpPropsSchema = z.object({
  props: z
    .object({
      code: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  style: z
    .object({
      color: COLOR_SCHEMA,
      backgroundColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      borderRadius: z.number().gte(0).optional().nullable(),
      fontSize: z.number().gte(0).optional().nullable(),
      fontFamily: FONT_FAMILY_SCHEMA,
      fontWeight: z.enum(['bold', 'normal']).optional().nullable(),
      letterSpacing: z.number().optional().nullable(),
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type OtpProps = z.infer<typeof OtpPropsSchema>;

// Export for runtime usage
export const OtpProps = OtpPropsSchema;

export const OtpPropsDefaults = {
  code: '123456',
} as const;

export function Otp({ props, style }: OtpProps) {
  const code = props?.code ?? OtpPropsDefaults.code;

  const wrapperStyle: CSSProperties = {
    textAlign: style?.textAlign ?? 'center',
    padding: getPadding(style?.padding),
  };

  const codeStyle: CSSProperties = {
    display: 'inline-block',
    color: style?.color ?? '#000000',
    backgroundColor: style?.backgroundColor ?? undefined,
    border: style?.borderColor ? `1px solid ${style.borderColor}` : undefined,
    borderRadius: style?.borderRadius != null ? `${style.borderRadius}px` : undefined,
    fontFamily: getFontFamily(style?.fontFamily) ?? '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace',
    fontSize: style?.fontSize ?? 32,
    fontWeight: style?.fontWeight ?? 'bold',
    letterSpacing: style?.letterSpacing != null ? `${style.letterSpacing}px` : '4px',
    padding:
      style?.backgroundColor || style?.borderColor
        ? '12px 20px'
        : undefined,
    // Override any auto-link styling that email clients might inject if their
    // data detectors mistakenly fire despite the suppressions below.
    textDecoration: 'none',
  };

  // Email-client auto-link suppression:
  //   - x-apple-data-detectors="false" disables iOS/macOS Mail data detectors
  //     for this element so a 6-digit code isn't turned into a phone number.
  //   - The wrapping <a href="#">...</a> trick prevents Gmail from autolinking
  //     the contents (Gmail doesn't autolink text already inside an anchor).
  //   - The inline color/text-decoration on the <a> keep it visually inert.
  const dataDetectorAttrs = {
    'x-apple-data-detectors': 'false',
    'data-detect-link': 'false',
  } as Record<string, string>;

  return (
    <div style={wrapperStyle} {...dataDetectorAttrs}>
      <a
        href="#"
        style={{
          ...codeStyle,
          color: codeStyle.color,
          textDecoration: 'none',
          cursor: 'default',
          pointerEvents: 'none',
        }}
        {...dataDetectorAttrs}
      >
        {code}
      </a>
    </div>
  );
}

export default Otp;
