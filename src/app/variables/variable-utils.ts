import { TEditorConfiguration } from '@editor/core';

export const VARIABLE_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
export const MAX_VARIABLE_NAME_LENGTH = 64;
export const RESERVED_VARIABLE_NAMES = new Set(['this', 'true', 'false', 'null', 'undefined']);
const HANDLEBARS_KEYWORDS = new Set(['if', 'each', 'unless', 'else', 'with']);

export type TemplateVariable = {
  name: string;
  description?: string | null;
  sampleValue?: string | null;
};

export function validateVariableName(
  name: string,
  siblings: TemplateVariable[],
  indexBeingEdited?: number
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length > MAX_VARIABLE_NAME_LENGTH) return `Max ${MAX_VARIABLE_NAME_LENGTH} characters`;
  if (!VARIABLE_NAME_RE.test(trimmed)) return 'Use letters, digits, underscore; start with a letter or underscore';
  if (RESERVED_VARIABLE_NAMES.has(trimmed)) return 'Reserved word; pick another name';
  const duplicate = siblings.some((v, i) => i !== indexBeingEdited && v.name === trimmed);
  if (duplicate) return 'Already declared';
  return null;
}

// Matches Handlebars expressions: simple `{{foo}}`, subpath `{{foo.bar}}`, and
// block helpers `{{#if foo}}`/`{{#each foo}}`/`{{#unless foo}}` (and their
// subpaths). Captures the root identifier in group 1.
const TOKEN_ROOT_RE = /\{\{\s*(?:#(?:if|each|unless|with)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)(?:\.[\w.]+)?\s*\}\}/g;

export function extractTokenRoots(text: string | null | undefined): string[] {
  if (!text) return [];
  const roots = new Set<string>();
  for (const m of text.matchAll(TOKEN_ROOT_RE)) {
    const name = m[1];
    if (RESERVED_VARIABLE_NAMES.has(name) || HANDLEBARS_KEYWORDS.has(name)) continue;
    roots.add(name);
  }
  return [...roots];
}

function forEachTextFieldInDocument(
  doc: TEditorConfiguration,
  visit: (value: string) => void
) {
  const root = doc.root;
  if (root && root.type === 'EmailLayout' && typeof (root.data as any)?.subject === 'string') {
    visit((root.data as any).subject);
  }
  for (const [id, block] of Object.entries(doc)) {
    if (id === 'root' || !block || typeof block !== 'object') continue;
    const type = (block as any).type;
    const props = (block as any).data?.props;
    if (!props) continue;
    if ((type === 'Text' || type === 'Heading' || type === 'Button') && typeof props.text === 'string') {
      visit(props.text);
    } else if (type === 'Html' && typeof props.contents === 'string') {
      visit(props.contents);
    }
  }
}

export function collectTokenUsage(doc: TEditorConfiguration): Map<string, number> {
  const usage = new Map<string, number>();
  forEachTextFieldInDocument(doc, (value) => {
    for (const root of extractTokenRoots(value)) {
      usage.set(root, (usage.get(root) ?? 0) + 1);
    }
  });
  return usage;
}

function escapeRegex(name: string) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRenameReplacers(oldName: string, newName: string) {
  const esc = escapeRegex(oldName);
  const simple = new RegExp(`\\{\\{\\s*${esc}(\\.[\\w.]+)?\\s*\\}\\}`, 'g');
  const helper = new RegExp(`(\\{\\{\\s*#(?:if|each|unless|with)\\s+)${esc}(\\.[\\w.]+)?(\\s*\\}\\})`, 'g');
  return (text: string) => text.replace(helper, `$1${newName}$2$3`).replace(simple, `{{${newName}$1}}`);
}

/**
 * Returns a partial-document patch (object suitable for `setDocument`) that
 * rewrites `{{oldName}}` and `{{oldName.*}}` to `{{newName}}`/`{{newName.*}}`
 * across text/heading/button/html blocks and the EmailLayout subject. Blocks
 * with no change are not included in the patch.
 */
export function buildRenamePatch(
  doc: TEditorConfiguration,
  oldName: string,
  newName: string
): Partial<TEditorConfiguration> {
  if (oldName === newName) return {};
  const rewrite = buildRenameReplacers(oldName, newName);
  const patch: Partial<TEditorConfiguration> = {};

  const root = doc.root;
  if (root && root.type === 'EmailLayout') {
    const layoutData = root.data as any;
    const oldSubject: string = layoutData.subject ?? '';
    const newSubject = rewrite(oldSubject);
    if (newSubject !== oldSubject) {
      patch.root = { ...root, data: { ...layoutData, subject: newSubject } } as any;
    }
  }

  for (const [id, block] of Object.entries(doc)) {
    if (id === 'root' || !block || typeof block !== 'object') continue;
    const type = (block as any).type;
    const data = (block as any).data;
    const props = data?.props;
    if (!props) continue;

    if ((type === 'Text' || type === 'Heading' || type === 'Button') && typeof props.text === 'string') {
      const nextText = rewrite(props.text);
      if (nextText !== props.text) {
        (patch as any)[id] = { ...block, data: { ...data, props: { ...props, text: nextText } } };
      }
    } else if (type === 'Html' && typeof props.contents === 'string') {
      const nextContents = rewrite(props.contents);
      if (nextContents !== props.contents) {
        (patch as any)[id] = { ...block, data: { ...data, props: { ...props, contents: nextContents } } };
      }
    }
  }

  return patch;
}

/**
 * Substitutes declared variables' sample values into a text string. Subpath
 * access (e.g. `{{user.name}}`) resolves to the root's sample value — matches
 * the top-level declaration model. Block helpers (`{{#if}}`, `{{#each}}`,
 * `{{#unless}}`, `{{#with}}`) and their closers are stripped so their content
 * renders inline; the block body is not interpreted.
 */
export function substituteSampleValues(text: string, samples: Map<string, string>): string {
  if (!text) return text;
  let out = text;
  out = out.replace(
    /\{\{\s*#(?:if|each|unless|with)\s+[^}]*\}\}/g,
    ''
  );
  out = out.replace(/\{\{\s*\/(?:if|each|unless|with)\s*\}\}/g, '');
  out = out.replace(/\{\{\s*else\s*\}\}/g, '');
  out = out.replace(TOKEN_ROOT_RE, (match, root: string) => {
    if (!samples.has(root)) return match;
    return samples.get(root) ?? '';
  });
  return out;
}

export function buildSampleValueMap(variables: TemplateVariable[] | null | undefined): Map<string, string> {
  const m = new Map<string, string>();
  if (!variables) return m;
  for (const v of variables) {
    if (v.name && typeof v.sampleValue === 'string' && v.sampleValue.length > 0) {
      m.set(v.name, v.sampleValue);
    }
  }
  return m;
}

/**
 * Returns a shallow-cloned document with sample values substituted into
 * text/heading/button/html blocks and the EmailLayout subject. Used as a
 * preview transform — does not mutate the source document.
 */
export function applySampleValuesToDocument(
  doc: TEditorConfiguration,
  samples: Map<string, string>
): TEditorConfiguration {
  if (samples.size === 0) return doc;
  const next: TEditorConfiguration = { ...doc };

  const root = doc.root;
  if (root && root.type === 'EmailLayout') {
    const layoutData = root.data as any;
    if (typeof layoutData.subject === 'string') {
      const newSubject = substituteSampleValues(layoutData.subject, samples);
      if (newSubject !== layoutData.subject) {
        next.root = { ...root, data: { ...layoutData, subject: newSubject } } as any;
      }
    }
  }

  for (const [id, block] of Object.entries(doc)) {
    if (id === 'root' || !block || typeof block !== 'object') continue;
    const type = (block as any).type;
    const data = (block as any).data;
    const props = data?.props;
    if (!props) continue;

    if ((type === 'Text' || type === 'Heading' || type === 'Button') && typeof props.text === 'string') {
      const newText = substituteSampleValues(props.text, samples);
      if (newText !== props.text) {
        (next as any)[id] = { ...block, data: { ...data, props: { ...props, text: newText } } };
      }
    } else if (type === 'Html' && typeof props.contents === 'string') {
      const newContents = substituteSampleValues(props.contents, samples);
      if (newContents !== props.contents) {
        (next as any)[id] = { ...block, data: { ...data, props: { ...props, contents: newContents } } };
      }
    }
  }

  return next;
}
