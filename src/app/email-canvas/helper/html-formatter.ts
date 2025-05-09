/**
 * HTML formatter using the lightweight htmlfy library
 * https://github.com/j4w8n/htmlfy
 */

import { prettify } from 'htmlfy';

/**
 * Format HTML string using htmlfy's prettify function 
 * @param html The HTML string to format
 * @param spaces Indentation spaces (default: 2)
 * @returns Formatted HTML
 */
export function formatHtml(html: string, spaces: number = 2): string {
  try {
    return prettify(html, {
      tab_size: spaces,
      content_wrap: 80,  // Wrap content at 80 characters
      tag_wrap: 60,      // Wrap tag attributes at 60 characters
      ignore: []         // Don't ignore any elements
    });
  } catch (e) {
    console.error('Error formatting HTML:', e);
    // Fallback to basic formatting if htmlfy fails
    return html.trim()
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');
  }
}

/**
 * Minify HTML string using htmlfy's minify function
 * @param html The HTML string to minify
 * @returns Minified HTML
 */
export function minifyHtml(html: string): string {
  try {
    return minify(html);
  } catch (e) {
    console.error('Error minifying HTML:', e);
    // Fallback to basic minification
    return html.replace(/>\s+</g, '><').trim();
  }
} 