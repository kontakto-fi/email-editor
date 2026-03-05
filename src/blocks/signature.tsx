import React, { CSSProperties } from 'react';
import { z } from 'zod';

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

export const SignaturePropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      fontFamily: FONT_FAMILY_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      greeting: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      company: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      website: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      imageSize: z.number().optional().nullable(),
      imageShape: z.enum(['circle', 'square', 'rounded']).optional().nullable(),
      layout: z.enum(['horizontal', 'vertical']).optional().nullable(),
      nameColor: COLOR_SCHEMA,
      textColor: COLOR_SCHEMA,
      linkColor: COLOR_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type SignatureProps = z.infer<typeof SignaturePropsSchema>;
export const SignatureProps = SignaturePropsSchema;

export const SignaturePropsDefaults = {
  greeting: '',
  name: '',
  title: '',
  company: '',
  address: '',
  email: '',
  phone: '',
  website: '',
  imageUrl: '',
  imageSize: 64,
  imageShape: 'circle',
  layout: 'horizontal',
  nameColor: '#262626',
  textColor: '#666666',
  linkColor: '#0079CC',
} as const;

function getImageBorderRadius(shape: string, size: number): number | undefined {
  switch (shape) {
    case 'circle':
      return size;
    case 'rounded':
      return size * 0.125;
    case 'square':
    default:
      return undefined;
  }
}

export function Signature({ style, props }: SignatureProps) {
  const greeting = props?.greeting ?? SignaturePropsDefaults.greeting;
  const name = props?.name ?? SignaturePropsDefaults.name;
  const title = props?.title ?? SignaturePropsDefaults.title;
  const company = props?.company ?? SignaturePropsDefaults.company;
  const address = props?.address ?? SignaturePropsDefaults.address;
  const email = props?.email ?? SignaturePropsDefaults.email;
  const phone = props?.phone ?? SignaturePropsDefaults.phone;
  const website = props?.website ?? SignaturePropsDefaults.website;
  const imageUrl = props?.imageUrl ?? SignaturePropsDefaults.imageUrl;
  const imageSize = props?.imageSize ?? SignaturePropsDefaults.imageSize;
  const imageShape = props?.imageShape ?? SignaturePropsDefaults.imageShape;
  const layout = props?.layout ?? SignaturePropsDefaults.layout;
  const nameColor = props?.nameColor ?? SignaturePropsDefaults.nameColor;
  const textColor = props?.textColor ?? SignaturePropsDefaults.textColor;
  const linkColor = props?.linkColor ?? SignaturePropsDefaults.linkColor;

  const wrapperStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    fontFamily: getFontFamily(style?.fontFamily),
    padding: getPadding(style?.padding),
  };

  const greetingStyle: CSSProperties = {
    fontSize: 14,
    color: textColor,
    margin: 0,
    marginBottom: 8,
    lineHeight: '1.4',
    fontStyle: 'italic',
  };

  const nameStyle: CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: nameColor,
    margin: 0,
    lineHeight: '1.4',
  };

  const detailStyle: CSSProperties = {
    fontSize: 14,
    color: textColor,
    margin: 0,
    lineHeight: '1.4',
  };

  const linkStyle: CSSProperties = {
    fontSize: 14,
    color: linkColor,
    textDecoration: 'none',
  };

  const imageElement = imageUrl ? (
    <img
      src={imageUrl}
      alt={name || company}
      width={imageSize}
      height={imageSize}
      style={{
        width: imageSize,
        height: imageSize,
        objectFit: 'cover',
        borderRadius: getImageBorderRadius(imageShape, imageSize),
        display: 'block',
        outline: 'none',
        border: 'none',
      }}
    />
  ) : null;

  const contactParts: JSX.Element[] = [];
  if (email) contactParts.push(<a key="email" href={`mailto:${email}`} style={linkStyle}>{email}</a>);
  if (phone) contactParts.push(<a key="phone" href={`tel:${phone}`} style={linkStyle}>{phone}</a>);
  if (website) {
    const href = website.startsWith('http') ? website : `https://${website}`;
    contactParts.push(<a key="website" href={href} style={linkStyle} target="_blank">{website}</a>);
  }

  const textContent = (
    <div>
      {name && <p style={nameStyle}>{name}</p>}
      {title && <p style={detailStyle}>{title}</p>}
      {company && <p style={detailStyle}>{company}</p>}
      {address && <p style={detailStyle}>{address}</p>}
      {contactParts.length > 0 && (
        <p style={{ ...detailStyle, marginTop: 4 }}>
          {contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={detailStyle}> &middot; </span>}
              {part}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );

  const greetingElement = greeting ? <p style={greetingStyle}>{greeting}</p> : null;

  if (layout === 'vertical') {
    return (
      <div style={wrapperStyle}>
        {greetingElement}
        {imageElement && <div style={{ marginBottom: 12 }}>{imageElement}</div>}
        {textContent}
      </div>
    );
  }

  // horizontal layout
  return (
    <div style={wrapperStyle}>
      {greetingElement}
      <table cellPadding="0" cellSpacing="0" border={0} role="presentation">
        <tbody>
          <tr>
            {imageElement && (
              <td style={{ verticalAlign: 'middle', paddingRight: 16 }}>
                {imageElement}
              </td>
            )}
            <td style={{ verticalAlign: 'middle' }}>
              {textContent}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Signature;
