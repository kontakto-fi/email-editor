# [1.5.0](https://github.com/kontakto-fi/email-editor/compare/v1.4.0...v1.5.0) (2026-03-05)


### Bug Fixes

* allow inline text editing by removing preventDefault from block wrapper ([7513973](https://github.com/kontakto-fi/email-editor/commit/751397327db41d032f7b3f0de8d3c2eb693188f3))
* hide samples drawer toggle when samplesDrawerEnabled is false ([e568c0e](https://github.com/kontakto-fi/email-editor/commit/e568c0eccbe8d1f5c8ac30da97478df33bf03921))
* remove platform-specific @rollup/rollup-linux-x64-gnu dependency ([bb05e6e](https://github.com/kontakto-fi/email-editor/commit/bb05e6ea4a5026391dcb9943f1e770f04bdc223a))
* remove unused imports and variables breaking DTS build ([addbf39](https://github.com/kontakto-fi/email-editor/commit/addbf395fbeb771a14081e37fc55f89afbcf1101))
* reorder package.json exports so types condition is checked first ([53bc320](https://github.com/kontakto-fi/email-editor/commit/53bc320062a0b73bdaf5ebf724cb45ad49722f7a))
* **test:** fix flaky e2e tests and remove unreliable ones ([bdc7e6e](https://github.com/kontakto-fi/email-editor/commit/bdc7e6e2534f5c69cdb7f0dc18dd26f3a58eab5c))
* **test:** update e2e test selectors for reliability ([4096eac](https://github.com/kontakto-fi/email-editor/commit/4096eac865a5ab33ca1b2b9d2b6d2b7a891ae4ae))


### Features

* add block copy/paste and delete keyboard shortcuts ([f817036](https://github.com/kontakto-fi/email-editor/commit/f817036c598beae5c2609971e320375384c32589))
* add inline editors for Button, Html, and Signature blocks ([fe07818](https://github.com/kontakto-fi/email-editor/commit/fe07818f7efc7ff422baf131b6d996cb22f8f967))
* add Signature block with personal and company presets ([3e56130](https://github.com/kontakto-fi/email-editor/commit/3e561301372dfef84d05a89d02f3e1829c8a4a5b))

# [1.4.0](https://github.com/kontakto-fi/email-editor/compare/v1.3.3...v1.4.0) (2026-03-05)


### Features

* add renderToText() and plain text preview tab ([c6b1869](https://github.com/kontakto-fi/email-editor/commit/c6b186957ab191c554d2cab7b1a3609d3dd850bf))

## [1.3.3](https://github.com/kontakto-fi/email-editor/compare/v1.3.2...v1.3.3) (2026-03-02)


### Bug Fixes

* **session:** reset document synchronously during render ([847d431](https://github.com/kontakto-fi/email-editor/commit/847d43119fe6ccdba8b0f9e5b9580a4fbb75555f))

## [1.3.2](https://github.com/kontakto-fi/email-editor/compare/v1.3.1...v1.3.2) (2026-03-02)


### Bug Fixes

* **session:** reset editor when initialTemplate prop changes ([d13d80a](https://github.com/kontakto-fi/email-editor/commit/d13d80ad222f45f6d6f171cd19f814a9487a165e))

## [1.3.1](https://github.com/kontakto-fi/email-editor/compare/v1.3.0...v1.3.1) (2026-03-02)


### Bug Fixes

* resolve all npm vulnerabilities ([ad27261](https://github.com/kontakto-fi/email-editor/commit/ad272614149cb339b70ed74b59d06576c2a9938c))

# [1.3.0](https://github.com/kontakto-fi/email-editor/compare/v1.2.1...v1.3.0) (2026-03-02)


### Bug Fixes

* prevent focus loss on every keystroke when editing blocks ([e7124dd](https://github.com/kontakto-fi/email-editor/commit/e7124ddb9203227c492e5bd2fbdf7881c4ededb4))


### Features

* accept raw HTML string as initialTemplate ([a25ad98](https://github.com/kontakto-fi/email-editor/commit/a25ad98d076af5274021272de2d270b364322c28))

## [1.2.1](https://github.com/kontakto-fi/email-editor/compare/v1.2.0...v1.2.1) (2026-03-02)


### Bug Fixes

* move react to peerDependencies only, fix exports for modern bundlers ([adc1bb5](https://github.com/kontakto-fi/email-editor/commit/adc1bb5bc4620f3517f44406ca832568a107b933))

# [1.2.0](https://github.com/kontakto-fi/email-editor/compare/v1.1.1...v1.2.0) (2025-05-09)


### Features

* **theming:** theming was improved ([7ba9194](https://github.com/kontakto-fi/email-editor/commit/7ba91944336ef1e1acef4aaec4c34cdd75912237))

## [1.1.1](https://github.com/kontakto-fi/email-editor/compare/v1.1.0...v1.1.1) (2025-05-09)


### Bug Fixes

* **code-formatting:** prettier was replaced with lightweight solutions ([341b940](https://github.com/kontakto-fi/email-editor/commit/341b94024b79a597a9bc6d9c010c0b9fbd4471c7))

# [1.1.0](https://github.com/kontakto-fi/email-editor/compare/v1.0.2...v1.1.0) (2025-05-09)


### Features

* **height-control:** enable controlling the height of the email editor ([38f205b](https://github.com/kontakto-fi/email-editor/commit/38f205b23939a3d3a22146c7f9f88848f4013e19))

## [1.0.2](https://github.com/kontakto-fi/email-editor/compare/v1.0.1...v1.0.2) (2025-05-09)


### Bug Fixes

* **persistence:** disable saving by default ([d81aaa7](https://github.com/kontakto-fi/email-editor/commit/d81aaa7d16bd459d70b0e1379d8773e4d3a83412))

## [1.0.1](https://github.com/kontakto-fi/email-editor/compare/v1.0.0...v1.0.1) (2025-05-09)


### Bug Fixes

* readme ([b56a706](https://github.com/kontakto-fi/email-editor/commit/b56a70625bf75ad393065fc68408362e8dcab382))

# 1.0.0 (2025-05-09)


### Bug Fixes

* **build:** resolve build errors ([b76e41a](https://github.com/kontakto-fi/email-editor/commit/b76e41a182f678a477216f7bf0073a031b4c7a8d))
* **text-editor:** show paddings correctly in editor ([6f0bd7e](https://github.com/kontakto-fi/email-editor/commit/6f0bd7edd6f439de2904db89a5ce1f80e5429a95))


### Features

* **templates:** update template APIs ([2c09b1d](https://github.com/kontakto-fi/email-editor/commit/2c09b1db69867ca933b6b055b88ca5b486b7902e))
* **templating:** update email templates with dynamic placeholders ([95751d9](https://github.com/kontakto-fi/email-editor/commit/95751d9f30a78ba29402e53af9a133545eed1bf5))
