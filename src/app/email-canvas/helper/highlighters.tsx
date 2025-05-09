import hljs from 'highlight.js';
import jsonHighlighter from 'highlight.js/lib/languages/json';
import xmlHighlighter from 'highlight.js/lib/languages/xml';
import { formatHtml } from './html-formatter';

hljs.registerLanguage('json', jsonHighlighter);
hljs.registerLanguage('html', xmlHighlighter);

export async function html(value: string): Promise<string> {
  try {
    // Use our custom formatter
    const prettyValue = formatHtml(value, 2);
    return hljs.highlight(prettyValue, { language: 'html' }).value;
  } catch (e) {
    console.error('Error highlighting HTML:', e);
    return hljs.highlight(value, { language: 'html' }).value;
  }
}

export async function json(value: string): Promise<string> {
  try {
    // Try to parse and then format with native JSON.stringify
    const parsed = JSON.parse(value);
    const prettyValue = JSON.stringify(parsed, null, 2);
    return hljs.highlight(prettyValue, { language: 'javascript' }).value;
  } catch (e) {
    console.error('Error highlighting JSON:', e);
    // If parsing fails, just highlight the original value
    return hljs.highlight(value, { language: 'javascript' }).value;
  }
}
