import React, { useState, useEffect, CSSProperties } from 'react';
import { TextProps, TextPropsDefaults, EmailMarkdown } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useDocument, useSelectedBlockId } from '@editor/editor-context';

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
  
  if (typeof padding === 'number') {
    return `${padding}px`;
  }
  
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
  
  return undefined;
}

export default function TextEditor({ style, props }: TextProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const document = useDocument();
  const isSelected = selectedBlockId === blockId;
  
  // Get the current text from props
  const textContent = props?.text ?? TextPropsDefaults.text;
  const [localText, setLocalText] = useState(textContent);
  const isMarkdown = props?.markdown ?? false;
  
  // Get email root settings for inherited font
  const rootBlock = document.root;
  const rootFontFamily = rootBlock && rootBlock.type === 'EmailLayout' 
    ? getFontFamily(rootBlock.data.fontFamily) 
    : '"Helvetica Neue", Arial, sans-serif';
  
  // Update local state when text changes from other sources
  useEffect(() => {
    setLocalText(textContent);
  }, [textContent]);
  
  // Determine the actual font family to use
  const fontFamily = getFontFamily(style?.fontFamily) || rootFontFamily;
  
  // Create styles for displaying the text
  const wStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontSize: style?.fontSize ?? undefined,
    fontFamily,
    fontWeight: style?.fontWeight ?? undefined,
    textAlign: style?.textAlign ?? undefined,
    padding: getPadding(style?.padding),
    width: '100%',
    minHeight: '1em'
  };
  
  // Additional styles for the textarea
  const textareaStyle: CSSProperties = {
    ...wStyle,
    border: 'none',
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    lineHeight: 'inherit',
    margin: 0,
    display: 'block',
    width: '100%',
    fontSize: wStyle.fontSize,
    fontWeight: wStyle.fontWeight,
    textAlign: wStyle.textAlign
  };
  
  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    
    // Update the document with the new text
    setDocument({
      [blockId]: {
        type: 'Text',
        data: {
          style,
          props: {
            ...props,
            text: newText
          }
        }
      }
    });
  };
  
  // Auto-resize textarea based on content
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  // If the block is selected and not markdown, show a textarea
  if (isSelected && !isMarkdown) {
    return (
      <textarea
        value={localText}
        onChange={handleTextChange}
        style={textareaStyle}
        rows={1}
        onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
        ref={(el) => el && adjustTextareaHeight(el)}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  
  // Otherwise, just display the text as before
  if (isMarkdown) {
    // For markdown content, use the EmailMarkdown component
    return <EmailMarkdown style={wStyle} markdown={textContent} />;
  }
  
  return <div style={wStyle}>{textContent}</div>;
} 