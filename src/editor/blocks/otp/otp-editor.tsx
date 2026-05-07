import React, { CSSProperties, useEffect, useRef, useState } from 'react';

import { Otp, OtpProps, OtpPropsDefaults } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useSelectedBlockId } from '@editor/editor-context';

export default function OtpEditor({ props, style }: OtpProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === blockId;

  const code = props?.code ?? OtpPropsDefaults.code;
  const [localCode, setLocalCode] = useState(code);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isSelected]);

  if (!isSelected) {
    return <Otp props={props} style={style} />;
  }

  const commit = (newCode: string) => {
    setLocalCode(newCode);
    setDocument({
      [blockId]: {
        type: 'Otp',
        data: {
          style,
          props: { ...props, code: newCode },
        },
      },
    });
  };

  const wrapperStyle: CSSProperties = {
    textAlign: style?.textAlign ?? 'center',
    padding: style?.padding
      ? `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`
      : undefined,
  };

  const inputStyle: CSSProperties = {
    display: 'inline-block',
    color: style?.color ?? '#000000',
    backgroundColor: style?.backgroundColor ?? 'transparent',
    border: style?.borderColor ? `1px solid ${style.borderColor}` : '1px dashed #999',
    borderRadius: style?.borderRadius != null ? `${style.borderRadius}px` : 4,
    fontFamily: '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace',
    fontSize: style?.fontSize ?? 32,
    fontWeight: style?.fontWeight ?? 'bold',
    letterSpacing: style?.letterSpacing != null ? `${style.letterSpacing}px` : '4px',
    textAlign: 'center',
    padding: '12px 20px',
    outline: 'none',
    minWidth: 120,
  };

  return (
    <div style={wrapperStyle}>
      <input
        ref={inputRef}
        type="text"
        value={localCode}
        onChange={(e) => commit(e.target.value)}
        style={inputStyle}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
