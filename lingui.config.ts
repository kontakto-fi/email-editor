import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

const config: LinguiConfig = {
  sourceLocale: 'en',
  locales: ['en', 'sv', 'fi'],
  fallbackLocales: {
    default: 'en',
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  // `explicitIdAsDefault` makes msgid the canonical key (e.g. "tune.move-up"),
  // rather than re-hashing it at compile time.
  format: formatter({ explicitIdAsDefault: true }),
  compileNamespace: 'ts',
};

export default config;
