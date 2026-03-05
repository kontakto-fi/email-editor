import React, { useState, useEffect, CSSProperties } from 'react';
import { HtmlProps } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useSelectedBlockId } from '@editor/editor-context';

export default function HtmlEditor({ style, props }: HtmlProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === blockId;

  const contents = props?.contents ?? '';
  const [localContents, setLocalContents] = useState(contents);

  useEffect(() => {
    setLocalContents(contents);
  }, [contents]);

  const cssStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontSize: style?.fontSize ?? undefined,
    textAlign: style?.textAlign ?? undefined,
    padding: style?.padding
      ? `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`
      : undefined,
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setLocalContents(newContents);
    setDocument({
      [blockId]: {
        type: 'Html',
        data: {
          style,
          props: {
            ...props,
            contents: newContents,
          },
        },
      },
    });
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  if (isSelected) {
    const textareaStyle: CSSProperties = {
      ...cssStyle,
      fontFamily: '"Nimbus Mono PS", "Courier New", monospace',
      fontSize: 13,
      color: cssStyle.color ?? '#333',
      border: 'none',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      width: '100%',
      display: 'block',
      margin: 0,
      backgroundColor: 'transparent',
    };

    return (
      <div style={cssStyle}>
        <textarea
          value={localContents}
          onChange={handleChange}
          style={textareaStyle}
          rows={3}
          onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
          ref={(el) => el && adjustTextareaHeight(el)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  if (!contents) {
    return <div style={cssStyle} />;
  }
  return <div style={cssStyle} dangerouslySetInnerHTML={{ __html: contents }} />;
}
