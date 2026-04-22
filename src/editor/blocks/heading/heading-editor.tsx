import React, { useState, useEffect, useLayoutEffect, useRef, CSSProperties } from 'react';
import { HeadingProps, HeadingPropsDefaults, renderInlineMarkdownString } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, setLastFocusedEditable, useDocument, useSelectedBlockId } from '@editor/editor-context';

import { useMarkdownToolbar } from '../helpers/use-markdown-toolbar';
import InlineFormattingToolbar from '../text/inline-formatting-toolbar';

// Helper function to get font family from existing Heading component
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

// Helper function to get font size based on heading level
function getFontSize(level: 'h1' | 'h2' | 'h3') {
  switch (level) {
    case 'h1':
      return 32;
    case 'h2':
      return 24;
    case 'h3':
      return 20;
  }
}

export default function HeadingEditor({ style, props }: HeadingProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const document = useDocument();
  const isSelected = selectedBlockId === blockId;

  const level = props?.level ?? HeadingPropsDefaults.level;
  const textContent = props?.text ?? HeadingPropsDefaults.text;
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

  const hStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontWeight: style?.fontWeight ?? 'bold',
    lineHeight: style?.lineHeight ?? undefined,
    letterSpacing: style?.letterSpacing != null ? `${style.letterSpacing}px` : undefined,
    textAlign: style?.textAlign ?? undefined,
    margin: 0,
    fontFamily,
    fontSize: getFontSize(level),
    padding: getPadding(style?.padding),
    width: '100%',
    minHeight: '1em',
  };

  const textareaStyle: CSSProperties = {
    ...hStyle,
    border: 'none',
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    lineHeight: hStyle.lineHeight ?? 'inherit',
    margin: 0,
    display: 'block',
    width: '100%'
  };

  const commitText = (newText: string, opts?: { enableMarkdown?: boolean }) => {
    setLocalText(newText);
    setDocument({
      [blockId]: {
        type: 'Heading',
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

  // See text-editor.tsx: seed the textarea with at least the rendered heading's
  // height so the click-to-edit transition doesn't shrink.
  const displayRef = useRef<HTMLHeadingElement | null>(null);
  const lastDisplayHeightRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!isSelected && displayRef.current) {
      const h = displayRef.current.offsetHeight;
      if (h > 0) lastDisplayHeightRef.current = h;
    }
  }, [isSelected, textContent, isMarkdown, level]);

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    if (!element) return;
    element.style.height = 'auto';
    const scrollH = element.scrollHeight;
    const floor = lastDisplayHeightRef.current;
    element.style.height = `${Math.max(scrollH, floor)}px`;
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

  useLayoutEffect(() => {
    if (textareaRef.current) adjustTextareaHeight(textareaRef.current);
  }, [localText, isSelected]);

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

  const headingProps: React.HTMLAttributes<HTMLHeadingElement> & {
    ref: React.RefObject<HTMLHeadingElement>;
  } = isMarkdown
    ? {
        ref: displayRef,
        style: hStyle,
        dangerouslySetInnerHTML: { __html: renderInlineMarkdownString(textContent) },
      }
    : { ref: displayRef, style: hStyle, children: textContent };

  switch (level) {
    case 'h1':
      return <h1 {...headingProps} />;
    case 'h2':
      return <h2 {...headingProps} />;
    case 'h3':
      return <h3 {...headingProps} />;
  }
}
