import React, { useState, useEffect, CSSProperties } from 'react';
import { HeadingProps, HeadingPropsDefaults } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useDocument, useSelectedBlockId } from '@editor/editor-context';

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
  
  // Get the current text and level from props
  const level = props?.level ?? HeadingPropsDefaults.level;
  const textContent = props?.text ?? HeadingPropsDefaults.text;
  const [localText, setLocalText] = useState(textContent);
  
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
  
  // Create styles for displaying the heading
  const hStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontWeight: style?.fontWeight ?? 'bold',
    textAlign: style?.textAlign ?? undefined,
    margin: 0,
    fontFamily,
    fontSize: getFontSize(level),
    padding: getPadding(style?.padding),
    width: '100%',
    minHeight: '1em',
  };
  
  // Additional styles for the textarea
  const textareaStyle: CSSProperties = {
    ...hStyle,
    border: 'none',
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    lineHeight: 'inherit',
    margin: 0,
    display: 'block',
    width: '100%'
  };
  
  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    
    // Update the document with the new text
    setDocument({
      [blockId]: {
        type: 'Heading',
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

  // If the block is selected, show a textarea
  if (isSelected) {
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
  
  // Otherwise, render the appropriate heading level
  switch (level) {
    case 'h1':
      return <h1 style={hStyle}>{textContent}</h1>;
    case 'h2':
      return <h2 style={hStyle}>{textContent}</h2>;
    case 'h3':
      return <h3 style={hStyle}>{textContent}</h3>;
  }
} 