import { i18n, type Messages } from '@lingui/core';

import { messages as en } from '../locales/en/messages';
import { messages as fi } from '../locales/fi/messages';
import { messages as sv } from '../locales/sv/messages';

export const SUPPORTED_LOCALES = ['en', 'sv', 'fi'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const CATALOGS: Record<SupportedLocale, Messages> = {
  en,
  sv,
  fi,
};

let loaded = false;

export function activateLocale(locale: string | undefined): SupportedLocale {
  const resolved: SupportedLocale = (SUPPORTED_LOCALES as readonly string[]).includes(locale ?? '')
    ? (locale as SupportedLocale)
    : 'en';
  if (locale && resolved !== locale) {
    // eslint-disable-next-line no-console
    console.warn(`[email-template-editor] Unsupported locale "${locale}", falling back to "en".`);
  }
  if (!loaded) {
    i18n.load({ en: CATALOGS.en, sv: CATALOGS.sv, fi: CATALOGS.fi });
    loaded = true;
  }
  i18n.activate(resolved);
  return resolved;
}

// Imperative translation helper — looks up `id` in the active catalog and
// falls back to `fallback` (or `id` itself) when the message is missing.
export function t(id: string, fallback?: string): string {
  return i18n._(id, {}, { message: fallback ?? id });
}

export { i18n };
export { Trans } from '@lingui/react';
