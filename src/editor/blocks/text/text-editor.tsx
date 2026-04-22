import React, { useState, useEffect, CSSProperties } from 'react';
import { TextProps, TextPropsDefaults, EmailMarkdown } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, setLastFocusedEditable, useDocument, useSelectedBlockId } from '@editor/editor-context';

import { useMarkdownToolbar } from '../helpers/use-markdown-toolbar';
import InlineFormattingToolbar from './inline-formatting-toolbar';

// Helper function to get font family from existing Text component
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
    case 'inherit':
    case null:
    case undefined:
      return undefined;
  }
  return undefined;
}

// Helper function to get padding from existing utils
function getPadding(padding: any) {
  if (!padding) return undefined;

  // Object format from the schema (matching the original blocks)
  if (typeof padding === 'object' && !Array.isArray(padding) &&
      'top' in padding && 'right' in padding && 'bottom' in padding && 'left' in padding) {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  // For backward compatibility with the array format
  if (Array.isArray(padding)) {
    if (padding.length === 1) {
      return `${padding[0]}px`;
    }
    if (padding.length === 2) {
      return `${padding[0]}px ${padding[1]}px`;
    }
    if (padding.length === 3) {
      return `${padding[0]}px ${padding[1]}px ${padding[2]}px`;
    }
    if (padding.length === 4) {
      return `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`;
    }
  }

  // For single number
  if (typeof padding === 'number') {
    return `${padding}px`;
  }

  return undefined;
}

export default function TextEditor({ style, props }: TextProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const document = useDocument();
  const isSelected = selectedBlockId === blockId;

  const textContent = props?.text ?? TextPropsDefaults.text;
  const [localText, setLocalText] = useState(textContent);
  const isMarkdown = props?.markdown ?? false;

  const rootBlock = document.root;
  const rootFontFamily = rootBlock && rootBlock.type === 'EmailLayout'
    ? getFontFamily(rootBlock.data.fontFamily)
    : '"Helvetica Neue", Arial, sans-serif';

  useEffect(() => {
    setLocalText(textContent);
  }, [textContent]);

  const fontFamily = getFontFamily(style?.fontFamily) || rootFontFamily;

  const wStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontSize: style?.fontSize ?? undefined,
    fontFamily,
    fontWeight: style?.fontWeight ?? undefined,
    lineHeight: style?.lineHeight ?? undefined,
    letterSpacing: style?.letterSpacing != null ? `${style.letterSpacing}px` : undefined,
    textAlign: style?.textAlign ?? undefined,
    padding: getPadding(style?.padding),
    width: '100%',
    minHeight: '1em'
  };

  const textareaStyle: CSSProperties = {
    ...wStyle,
    border: 'none',
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    lineHeight: wStyle.lineHeight ?? 'inherit',
    margin: 0,
    display: 'block',
    width: '100%',
    fontSize: wStyle.fontSize,
    fontWeight: wStyle.fontWeight,
    textAlign: wStyle.textAlign
  };

  const commitText = (newText: string, opts?: { enableMarkdown?: boolean }) => {
    setLocalText(newText);
    setDocument({
      [blockId]: {
        type: 'Text',
        data: {
          style,
          props: {
            ...props,
            text: newText,
            ...(opts?.enableMarkdown ? { markdown: true } : {}),
          },
        },
      },
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    commitText(e.target.value);
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  const { textareaRef, trackFocus, handleKeyDown, toolbarProps } = useMarkdownToolbar({
    text: localText,
    isSelected,
    commitText: (newText) => commitText(newText, { enableMarkdown: true }),
    trackSelection: (sel) => {
      setLastFocusedEditable({
        blockId,
        field: 'text',
        selectionStart: sel.start,
        selectionEnd: sel.end,
      });
    },
  });

  useEffect(() => {
    if (textareaRef.current) adjustTextareaHeight(textareaRef.current);
  }, [localText, textareaRef]);

  if (isSelected) {
    return (
      <>
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          onFocus={trackFocus}
          onSelect={trackFocus}
          onKeyUp={trackFocus}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            e.stopPropagation();
            trackFocus(e);
          }}
          style={textareaStyle}
          rows={1}
          onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
        />
        <InlineFormattingToolbar anchorEl={textareaRef.current} {...toolbarProps} />
      </>
    );
  }

  if (isMarkdown) {
    return <EmailMarkdown style={wStyle} markdown={textContent} />;
  }

  return <div style={wStyle}>{textContent}</div>;
}
