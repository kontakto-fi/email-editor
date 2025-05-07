import React, { useMemo } from 'react';

import { renderToStaticMarkup } from '../../email-builder';

import { useDocument } from '../../documents/editor/editor-context';

import HighlightedCodePanel from './helper/highlighted-code-panel';

export default function HtmlPanel() {
  const document = useDocument();
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
