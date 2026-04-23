# [2.3.0](https://github.com/kontakto-fi/email-editor/compare/v2.2.2...v2.3.0) (2026-04-23)


### Bug Fixes

* canvas workspace background extends to the bottom of the viewport ([56bddaa](https://github.com/kontakto-fi/email-editor/commit/56bddaa5973b6086ed60941ad05a115e503f44af))
* reveal row actions without hover; wire rename/delete for user samples ([57c9970](https://github.com/kontakto-fi/email-editor/commit/57c997012e5fa2a39dd9c36d42d5b9b7832ee5bf))
* treat built-in samples like user samples; resolve row layout overlap ([bcb4ce1](https://github.com/kontakto-fi/email-editor/commit/bcb4ce1d8fe0d5e3df1bfb8424a0a79a2fac814c))


### Features

* checkerboard workspace background by default, solid toggle in Settings ([0e9964a](https://github.com/kontakto-fi/email-editor/commit/0e9964a9011c0cf270a7c1cec65a95fd45ccf809))
* drag-and-drop reorder in the outline tab (and shared move-block core) ([e94748b](https://github.com/kontakto-fi/email-editor/commit/e94748bbba958b0c0f0f53cb672f4ac95d37c6e1))
* drag-and-drop reorder on the canvas too ([0411df9](https://github.com/kontakto-fi/email-editor/commit/0411df95f95cef865b29b887882f03c66f052bb1))
* edit tags alongside rename in the row's details dialog ([33d3f2a](https://github.com/kontakto-fi/email-editor/commit/33d3f2a7c6f1c4d0a9e8f927d7ab0dc7dcfaa71b))
* floating save bar below the email; Save now works on samples ([f3a3108](https://github.com/kontakto-fi/email-editor/commit/f3a31087316d89462eb13dc46060f7d8f0e78f14))
* optional Handlebars evaluation on renderToStaticMarkup/renderToText ([2104d9e](https://github.com/kontakto-fi/email-editor/commit/2104d9efdf833d828404403b1c87d1d5a959c0b1)), closes [#14](https://github.com/kontakto-fi/email-editor/issues/14)
* outline rows get type icons and move-up/down; unclip email card ([88ec6d1](https://github.com/kontakto-fi/email-editor/commit/88ec6d1d3cb93da999a09ea52752b9e3f608b361)), closes [#16](https://github.com/kontakto-fi/email-editor/issues/16)
* outline tree in the left drawer as a three-tab surface ([1bc36f8](https://github.com/kontakto-fi/email-editor/commit/1bc36f86da94f0a1bf02ddcf02e62408f08982e0)), closes [#9](https://github.com/kontakto-fi/email-editor/issues/9)
* rewrite welcome + reset-password samples as real copy, not placeholders ([1556945](https://github.com/kontakto-fi/email-editor/commit/15569459b11025b827a2760d7ba2504ea4068c8e))
* tag filter chips with All toggle spanning templates and samples ([6a1fc35](https://github.com/kontakto-fi/email-editor/commit/6a1fc352da3d4bc48bf575959469f27973f22528)), closes [#13](https://github.com/kontakto-fi/email-editor/issues/13)
* unified new-template picker with starter selection and sample authoring ([a516c86](https://github.com/kontakto-fi/email-editor/commit/a516c86583f793f878cf13ccabc4687f06c201c1))
* wrap the edit-mode canvas in a visible 'document' card ([4454201](https://github.com/kontakto-fi/email-editor/commit/445420179ae260bc40146e5b0ef17c70190e654b)), closes [#15](https://github.com/kontakto-fi/email-editor/issues/15)

## [2.2.2](https://github.com/kontakto-fi/email-editor/compare/v2.2.1...v2.2.2) (2026-04-22)


### Bug Fixes

* apply explicit paragraph margin in rendered markdown ([dbb7bd1](https://github.com/kontakto-fi/email-editor/commit/dbb7bd1cfb200e5b9898c9f620bf7beeef3d9232))

## [2.2.1](https://github.com/kontakto-fi/email-editor/compare/v2.2.0...v2.2.1) (2026-04-22)


### Bug Fixes

* keep editable textarea at least as tall as the rendered block ([b61b883](https://github.com/kontakto-fi/email-editor/commit/b61b883a8587a2f3add92a32d83c338015515575))

# [2.2.0](https://github.com/kontakto-fi/email-editor/compare/v2.1.0...v2.2.0) (2026-04-22)


### Features

* inline bold/italic/link toolbar on text and heading ([af38bdc](https://github.com/kontakto-fi/email-editor/commit/af38bdced2ad1663bc6ccf92bfc86d96d15824f6))
* slider-based line-height and letter-spacing controls ([9fa7e14](https://github.com/kontakto-fi/email-editor/commit/9fa7e146dc8a4ae3047195ae8b1048a9a1fbde87))

# [2.1.0](https://github.com/kontakto-fi/email-editor/compare/v2.0.0...v2.1.0) (2026-04-22)


### Features

* line-height and letter-spacing controls on text, heading, button ([c5421bd](https://github.com/kontakto-fi/email-editor/commit/c5421bdd274b0809682009ca7f89df230f99f642))
* optional image upload, library, and canvas drop/paste ([0bd7d83](https://github.com/kontakto-fi/email-editor/commit/0bd7d838da492725013ff6d8a2ef295ff3f44a52)), closes [#12](https://github.com/kontakto-fi/email-editor/issues/12)
* variables panel with rename rewrite, insert at cursor, and sample values ([630876f](https://github.com/kontakto-fi/email-editor/commit/630876fb9e171b86b310af5f999bc7f3eab3d98c)), closes [unless/#with](https://github.com/kontakto-fi/email-editor/issues/with) [#7](https://github.com/kontakto-fi/email-editor/issues/7)

# [2.0.0](https://github.com/kontakto-fi/email-editor/compare/v1.6.0...v2.0.0) (2026-04-22)


* feat!: built-in templates browser with search, sort, and row actions ([36c75b1](https://github.com/kontakto-fi/email-editor/commit/36c75b134e4c5924b28b630d7931bf94e5ff46e1)), closes [#4](https://github.com/kontakto-fi/email-editor/issues/4)
* feat!: save callbacks receive rendered HTML and text outputs ([b569894](https://github.com/kontakto-fi/email-editor/commit/b569894b8e912210e1d6a561ec16428fce5324bb)), closes [#5](https://github.com/kontakto-fi/email-editor/issues/5) [#5](https://github.com/kontakto-fi/email-editor/issues/5) [#6](https://github.com/kontakto-fi/email-editor/issues/6)
* feat!: unify samples and templates behind a kind discriminator ([6e1ec49](https://github.com/kontakto-fi/email-editor/commit/6e1ec49f820ad248ef42c67af67042ea3759c550)), closes [#8](https://github.com/kontakto-fi/email-editor/issues/8)


### Features

* editor owns subject line and variables metadata ([2a83b0a](https://github.com/kontakto-fi/email-editor/commit/2a83b0af080919cbfde583b07db2a37a408362d4)), closes [#5](https://github.com/kontakto-fi/email-editor/issues/5)


### BREAKING CHANGES

* `onSave(template)` → `onSave(payload: SavePayload)`.
`saveAs(name, content)` → `saveAs(name, payload: SavePayload)` returning
* `TemplateListItem` gains a required `kind` field.
Consumers must return `kind: 'template' | 'sample'` from their
`loadTemplates` and `loadSamples` callbacks. See README for the new
contract and suggested DB schema (`kind text not null default
'template'`).
* `loadTemplates` and `loadSamples` now return
`TemplateListItem[]` instead of `SampleTemplate[]`. The primary label
field renames from `name` to `slug`. Consumers must update their list
endpoints to return the new shape; see README for the new type and the
suggested DB schema changes.

# [1.6.0](https://github.com/kontakto-fi/email-editor/compare/v1.5.1...v1.6.0) (2026-03-25)


### Bug Fixes

* allow inline editing of markdown text blocks in editor ([5e4cc53](https://github.com/kontakto-fi/email-editor/commit/5e4cc53efa5716ff539c146f877434309d8abb60))
* replace Waypoint placeholder URLs with generic ones ([b3de438](https://github.com/kontakto-fi/email-editor/commit/b3de4382b71ffe0ebb8cdabea96a8e68131912a1))


### Features

* add "Disable backdrop" option for native-looking emails ([b9f163a](https://github.com/kontakto-fi/email-editor/commit/b9f163a5db1439d4729ee840ead41c6b7eea3100))

## [1.5.1](https://github.com/kontakto-fi/email-editor/compare/v1.5.0...v1.5.1) (2026-03-05)


### Bug Fixes

* simplify getPadding type to fix TS2345 error ([1cfea90](https://github.com/kontakto-fi/email-editor/commit/1cfea90b066a7e754b859887f77c39ef31862ac9))

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
