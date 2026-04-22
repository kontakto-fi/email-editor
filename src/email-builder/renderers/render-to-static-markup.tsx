import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import { evaluateHandlebars, type HandlebarsContext } from '../handlebars';
import { Reader, type TReaderDocument } from '../reader';

/**
 * Renders an email document to static HTML markup
 *
 * This function takes a document structure and renders it to static HTML
 * suitable for sending as an email. It adds the DOCTYPE and wraps everything
 * in basic HTML/body tags.
 *
 * When `variables` is provided, the rendered HTML is evaluated as a
 * Handlebars template — conditionals, loops, subpath access, and the
 * built-in `formatDate` / `formatNumber` helpers all resolve against the
 * given context. Without `variables`, the output keeps raw `{{name}}`
 * placeholders in place (the save-time, send-later shape).
 *
 * @param document The email document structure to render
 * @param options Options including the rootBlockId to start rendering from, and optional Handlebars context
 * @returns A complete HTML string representation of the email
 */
type TOptions = {
  rootBlockId: string;
  variables?: HandlebarsContext;
};

export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId, variables }: TOptions) {
  const html =
    '<!DOCTYPE html>' +
    baseRenderToStaticMarkup(
      <html>
        <body>
          <Reader document={document} rootBlockId={rootBlockId} />
        </body>
      </html>
    );
  if (!variables) return html;
  return evaluateHandlebars(html, variables);
}
