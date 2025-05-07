import React, { useMemo } from 'react';

import { useDocument } from '../../documents/editor/editor-context';

import HighlightedCodePanel from './helper/highlighted-code-panel';

export default function JsonPanel() {
  const document = useDocument();
  const code = useMemo(() => JSON.stringify(document, null, '  '), [document]);
  return <HighlightedCodePanel type="json" value={code} />;
}
