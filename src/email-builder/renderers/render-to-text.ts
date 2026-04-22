import { evaluateHandlebars, type HandlebarsContext } from '../handlebars';
import { type TReaderDocument } from '../reader';

type TOptions = {
  rootBlockId: string;
  variables?: HandlebarsContext;
};

export default function renderToText(document: TReaderDocument, { rootBlockId, variables }: TOptions): string {
  const lines: string[] = [];
  renderBlock(document, rootBlockId, lines);
  // Collapse 3+ consecutive blank lines into 2, then trim
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  if (!variables) return text;
  return evaluateHandlebars(text, variables);
}

function renderBlock(document: TReaderDocument, blockId: string, lines: string[]): void {
  const block = document[blockId];
  if (!block) return;

  const { type, data } = block;

  switch (type) {
    case 'EmailLayout':
      renderChildren(document, data?.childrenIds, lines);
      break;

    case 'Container':
      renderChildren(document, data?.props?.childrenIds, lines);
      break;

    case 'ColumnsContainer':
      renderColumnsContainer(document, data, lines);
      break;

    case 'Text':
      renderText(data, lines);
      break;

    case 'Heading':
      renderHeading(data, lines);
      break;

    case 'Button':
      renderButton(data, lines);
      break;

    case 'Image':
      renderImage(data, lines);
      break;

    case 'Avatar':
      renderAvatar(data, lines);
      break;

    case 'Html':
      renderHtml(data, lines);
      break;

    case 'Divider':
      lines.push('');
      lines.push('---');
      lines.push('');
      break;

    case 'Spacer':
      lines.push('');
      break;
  }
}

function renderChildren(document: TReaderDocument, childrenIds: string[] | null | undefined, lines: string[]): void {
  if (!childrenIds) return;
  for (const childId of childrenIds) {
    renderBlock(document, childId, lines);
  }
}

function renderColumnsContainer(document: TReaderDocument, data: any, lines: string[]): void {
  const columns = data?.props?.columns;
  if (!columns) return;
  for (const col of columns) {
    if (col?.childrenIds?.length) {
      renderChildren(document, col.childrenIds, lines);
    }
  }
}

function renderText(data: any, lines: string[]): void {
  const text = data?.props?.text ?? '';
  if (!text) return;

  if (data?.props?.markdown) {
    // Strip HTML tags from rendered markdown - the source is markdown so just use it directly
    lines.push(text);
  } else {
    lines.push(text);
  }
  lines.push('');
}

function renderHeading(data: any, lines: string[]): void {
  const text = data?.props?.text ?? '';
  if (!text) return;

  const level = data?.props?.level ?? 'h2';
  const prefix = level === 'h1' ? '# ' : level === 'h2' ? '## ' : '### ';
  lines.push(prefix + text);
  lines.push('');
}

function renderButton(data: any, lines: string[]): void {
  const text = data?.props?.text ?? '';
  const url = data?.props?.url ?? '';

  if (text && url) {
    lines.push(`${text}: ${url}`);
  } else if (text) {
    lines.push(text);
  } else if (url) {
    lines.push(url);
  }
  lines.push('');
}

function renderImage(data: any, lines: string[]): void {
  const alt = data?.props?.alt ?? '';
  const url = data?.props?.url ?? '';
  const linkHref = data?.props?.linkHref ?? '';

  if (alt && linkHref) {
    lines.push(`[${alt}] ${linkHref}`);
  } else if (alt) {
    lines.push(`[${alt}]`);
  } else if (url) {
    lines.push(`[Image: ${url}]`);
  }
  lines.push('');
}

function renderAvatar(data: any, lines: string[]): void {
  const alt = data?.props?.alt ?? '';
  if (alt) {
    lines.push(`[${alt}]`);
    lines.push('');
  }
}

function renderHtml(data: any, lines: string[]): void {
  const contents = data?.props?.contents ?? '';
  if (!contents) return;

  // Strip HTML tags to get plain text
  const text = stripHtml(contents);
  if (text) {
    lines.push(text);
    lines.push('');
  }
}

function stripHtml(html: string): string {
  return html
    // Replace <br> and <br/> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace block-level closing tags with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    // Replace <hr> with divider
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace per line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
