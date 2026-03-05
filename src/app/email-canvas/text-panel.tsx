import React, { useMemo } from 'react';

import { renderToText } from '@email-builder';

import { useDocument } from '@editor/editor-context';

export default function TextPanel() {
  const document = useDocument();
  const text = useMemo(() => renderToText(document, { rootBlockId: 'root' }), [document]);
  return (
    <pre
      style={{
        margin: 0,
        padding: 16,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        fontSize: '13px',
        fontFamily: 'monospace',
        lineHeight: '1.5',
      }}
      onClick={(ev) => {
        const s = window.getSelection();
        if (s === null) return;
        s.selectAllChildren(ev.currentTarget);
      }}
    >
      {text}
    </pre>
  );
}
