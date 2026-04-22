import Handlebars from 'handlebars';

/**
 * A fresh Handlebars environment scoped to the editor. Pre-registered with
 * `formatDate` and `formatNumber` helpers. Kept isolated from the global
 * `Handlebars` default instance so registrations here don't leak into the
 * consumer's own environment (and vice versa).
 */
export const editorHandlebars = Handlebars.create();

editorHandlebars.registerHelper('formatDate', function (value: unknown, format?: unknown) {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const spec = typeof format === 'string' ? format : undefined;
  if (!spec || spec === 'iso') return date.toISOString();
  if (spec === 'date') return date.toLocaleDateString();
  if (spec === 'time') return date.toLocaleTimeString();
  if (spec === 'datetime') return date.toLocaleString();
  return date.toLocaleDateString(undefined, { dateStyle: spec as any });
});

editorHandlebars.registerHelper('formatNumber', function (value: unknown, options?: unknown) {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  const hashOpts = (options && typeof options === 'object' && 'hash' in (options as any)
    ? (options as any).hash
    : {}) as {
      currency?: string;
      style?: string;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    };
  try {
    return new Intl.NumberFormat(undefined, {
      style: hashOpts.style as any,
      currency: hashOpts.currency,
      minimumFractionDigits: hashOpts.minimumFractionDigits,
      maximumFractionDigits: hashOpts.maximumFractionDigits,
    }).format(num);
  } catch {
    return String(num);
  }
});

export type HandlebarsContext = Record<string, unknown>;

/**
 * Compile `source` as a Handlebars template and render it with `context`.
 * Uses the scoped {@link editorHandlebars} instance.
 */
export function evaluateHandlebars(source: string, context: HandlebarsContext): string {
  const template = editorHandlebars.compile(source, { strict: false, noEscape: false });
  return template(context);
}
