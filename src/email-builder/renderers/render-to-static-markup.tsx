import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import { Reader, type TReaderDocument } from '../reader';

/**
 * Renders an email document to static HTML markup
 * 
 * This function takes a document structure and renders it to static HTML
 * suitable for sending as an email. It adds the DOCTYPE and wraps everything
 * in basic HTML/body tags.
 * 
 * @param document The email document structure to render
 * @param options Options including the rootBlockId to start rendering from
 * @returns A complete HTML string representation of the email
 */
type TOptions = {
  rootBlockId: string;
};

export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId }: TOptions) {
  return (
    '<!DOCTYPE html>' +
    baseRenderToStaticMarkup(
      <html>
        <body>
          <Reader document={document} rootBlockId={rootBlockId} />
        </body>
      </html>
    )
  );
} 