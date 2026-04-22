import { TEditorConfiguration } from '@editor/core';
import { renderToStaticMarkup, renderToText } from '@email-builder';

export type TemplateVariable = {
  name: string;
  description?: string;
  /** Optional sample value used by the editor's Preview mode to substitute `{{name}}` tokens. */
  sampleValue?: string;
};

/**
 * Payload passed to `onSave` / `saveAs`. The editor renders body HTML and
 * plain text on every save so consumers don't have to call the renderers
 * themselves — keeps the consumer's bundle decoupled from a specific
 * renderer version.
 */
export type SavePayload = {
  editorConfig: TEditorConfiguration;
  subject?: string;
  variables?: TemplateVariable[];
  bodyHtml: string;
  bodyText: string;
};

const ROOT_BLOCK_ID = 'root';

export function buildSavePayload(doc: TEditorConfiguration): SavePayload {
  const root = doc.root;
  const layoutData = (root && root.type === 'EmailLayout' ? root.data : undefined) as
    | { subject?: string | null; variables?: TemplateVariable[] | null }
    | undefined;

  return {
    editorConfig: doc,
    subject: layoutData?.subject ?? undefined,
    variables: layoutData?.variables ?? undefined,
    bodyHtml: renderToStaticMarkup(doc, { rootBlockId: ROOT_BLOCK_ID }),
    bodyText: renderToText(doc, { rootBlockId: ROOT_BLOCK_ID }),
  };
}
