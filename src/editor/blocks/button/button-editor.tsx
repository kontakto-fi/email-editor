import React, { useState, useEffect, CSSProperties } from 'react';
import { ButtonProps, ButtonPropsDefaults } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useSelectedBlockId } from '@editor/editor-context';

function getFontFamily(fontFamily: string | null | undefined) {
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

const getPadding = (padding: ButtonProps['style'] extends { padding?: infer P } ? P : never) =>
  padding ? `${(padding as any).top}px ${(padding as any).right}px ${(padding as any).bottom}px ${(padding as any).left}px` : undefined;

function getRoundedCorners(props: ButtonProps['props']) {
  const buttonStyle = props?.buttonStyle ?? ButtonPropsDefaults.buttonStyle;
  switch (buttonStyle) {
    case 'rectangle':
      return undefined;
    case 'pill':
      return 64;
    case 'rounded':
    default:
      return 4;
  }
}

function getButtonSizePadding(props: ButtonProps['props']) {
  const size = props?.size ?? ButtonPropsDefaults.size;
  switch (size) {
    case 'x-small':
      return [4, 8] as const;
    case 'small':
      return [8, 12] as const;
    case 'large':
      return [16, 32] as const;
    case 'medium':
    default:
      return [12, 20] as const;
  }
}

export default function ButtonEditor({ style, props }: ButtonProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === blockId;

  const text = props?.text ?? ButtonPropsDefaults.text;
  const fullWidth = props?.fullWidth ?? ButtonPropsDefaults.fullWidth;
  const buttonTextColor = props?.buttonTextColor ?? ButtonPropsDefaults.buttonTextColor;
  const buttonBackgroundColor = props?.buttonBackgroundColor ?? ButtonPropsDefaults.buttonBackgroundColor;

  const [localText, setLocalText] = useState(text);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const padding = getButtonSizePadding(props);
  const textRaise = (padding[1] * 2 * 3) / 4;

  const wrapperStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    textAlign: style?.textAlign ?? undefined,
    padding: getPadding(style?.padding),
  };

  const linkStyle: CSSProperties = {
    color: buttonTextColor,
    fontSize: style?.fontSize ?? 16,
    fontFamily: getFontFamily(style?.fontFamily),
    fontWeight: style?.fontWeight ?? 'bold',
    backgroundColor: buttonBackgroundColor,
    borderRadius: getRoundedCorners(props),
    display: fullWidth ? 'block' : 'inline-block',
    padding: `${padding[0]}px ${padding[1]}px`,
    textDecoration: 'none',
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    setDocument({
      [blockId]: {
        type: 'Button',
        data: {
          style,
          props: {
            ...props,
            text: newText,
          },
        },
      },
    });
  };

  if (isSelected) {
    const inputStyle: CSSProperties = {
      ...linkStyle,
      border: 'none',
      outline: 'none',
      cursor: 'text',
      width: fullWidth ? '100%' : undefined,
      textAlign: 'center',
    };

    return (
      <div style={wrapperStyle}>
        <input
          type="text"
          value={localText}
          onChange={handleTextChange}
          style={inputStyle}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <span style={linkStyle}>
        <span>{text}</span>
      </span>
    </div>
  );
}
