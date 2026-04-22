# Email Editor for React

A React-based email template editor component that allows users to create and customize email templates through a visual interface. This component can be embedded in any React application.

## Features

- Visual email template builder
- Rich set of components (text, buttons, images, dividers, containers, columns, etc.)
- Markdown support for text editing
- Responsive email templates
- Embeddable into React applications

## Installation

```bash
npm install @kontakto/email-template-editor
```

## Usage

### Embedding into existing project

You can easily embed the EmailEditor into any React application:

```jsx
import { EmailEditor } from '@kontakto/email-template-editor';

function MyApp() {
  return (
    <div className="my-container">
      <EmailEditor 
        persistenceEnabled={true}
        minHeight="80vh"
      />
    </div>
  );
}
```

#### Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minHeight` | string | '100vh' | Sets the minimum height of the editor container |
| `persistenceEnabled` | boolean | false | When true, enables save functionality and shows save buttons. Requires callbacks for persistence operations. |
| `samplesDrawerEnabled` | boolean | true | Controls whether the templates/samples drawer is shown |
| `drawerEnterDuration` | number | 225 | Duration for drawer enter transition (ms) |
| `drawerExitDuration` | number | 225 | Duration for drawer exit transition (ms) |
| `initialTemplate` | object | - | Initial template to load when editor first mounts |
| `initialTemplateId` | string | - | ID of the initial template |
| `initialTemplateName` | string | - | Name of the initial template |
| `onSave` | function | - | Callback when template is saved: `(payload: SavePayload) => void \| Promise<void>` (see SavePayload below) |
| `onChange` | function | - | Callback when template changes: `(template) => void` |
| `loadSamples` | function | - | Loads sample templates: `() => Promise<TemplateListItem[]>` |
| `loadTemplates` | function | - | Loads user templates: `() => Promise<TemplateListItem[]>` |
| `loadTemplate` | function | - | Loads specific template: `(id) => Promise<Template>` |
| `deleteTemplate` | function | - | Deletes a template: `(id) => void` |
| `copyTemplate` | function | - | Copies a template: `(name, content) => void` |
| `renameTemplate` | function | - | Renames a template: `(id, newSlug) => void \| Promise<void>` |
| `setTemplateKind` | function | - | Promotes/demotes a row between template and sample: `(id, kind) => void \| Promise<void>`. When omitted, promote/demote menu items are hidden. |
| `saveAs` | function | - | Saves template with a new name: `(name, payload: SavePayload) => Promise<{ id, slug }>` |
| `uploadImage` | function | - | Uploads a single image file: `(file: File) => Promise<UploadedImage>`. Enables the Upload button on the Image inspector, drag-and-drop on the canvas, and paste-image-to-insert. When omitted, all upload UI is hidden and URL paste remains the only way to set an image. |
| `loadImages` | function | - | Lists previously uploaded images for the library picker: `() => Promise<LibraryImage[]>`. Enables the "Library" button on the Image inspector. When omitted, the library button is hidden. |
| `deleteImage` | function | - | Deletes an image from the library by URL: `(url: string) => Promise<void>`. When omitted, the per-row delete button in the library is hidden. |

`TemplateListItem` is the lean list-endpoint shape (no `editor_config`):

```ts
type TemplateKind = 'template' | 'sample';

type TemplateListItem = {
  id: string;
  slug: string;                 // primary label
  kind: TemplateKind;           // 'template' (editable) or 'sample' (read-only starting point)
  description?: string;         // secondary line
  subject?: string;
  variables?: Array<{ name: string; description?: string }>;
  tags?: string[];
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

The drawer groups rows by `kind`, not by which callback returned them. Both `loadTemplates` and `loadSamples` should return their items with the correct `kind`; backends typically scope the two endpoints differently (per-user vs. org-wide), but the `kind` field is what determines the section a row appears in.

Samples are read-only starting points: Save on a loaded sample is disabled — the user must use Save As, which creates a fresh row with `kind='template'`.

#### Subject and variables

Email subject and template variables are stored on the `EmailLayout` block's data and round-trip with the editor configuration:

```ts
type EmailLayoutData = {
  // ...style fields
  subject?: string;
  variables?: Array<{ name: string; description?: string; sampleValue?: string }>;
};
```

The editor renders a subject input above the canvas (always visible, supports `{{variable}}` syntax) and a Variables tab in the right inspector panel for declaring variables. Both persist via the standard save flow — consumers who previously stored `subject` in a separate DB column can read it from the saved `editor_config` instead.

The Variables tab supports Handlebars-aware management:

- **Add/rename/delete**. Names follow Handlebars identifier rules (`[A-Za-z_][A-Za-z0-9_]*`, max 64 chars, reserved words rejected). Renaming a declared variable rewrites all `{{oldName}}` and `{{oldName.*}}` tokens in the subject and in text/heading/button/html blocks — including inside block helpers (`{{#if}}`, `{{#each}}`, `{{#unless}}`, `{{#with}}`).
- **Usage indicators.** Each row shows how many times the variable is referenced, or "Unused in body" if the declared name never appears. Tokens found in the body that aren't declared surface at the top of the panel with a one-click "add as variable" action.
- **Insert at cursor.** Focus a text/heading/button/html editor or the subject input, then click the Insert button next to a variable to splice `{{name}}` at the caret.
- **Sample values.** Each row has an optional `sampleValue` field that travels with the template (persisted on `editor_config.root.data.variables[].sampleValue`). In Preview mode, `{{name}}` and `{{name.*}}` tokens in the subject and in text/heading/button/html blocks render with the sample value substituted in; block helpers (`{{#if}}`, `{{#each}}`, …) are stripped so their content renders inline, but the control flow is not evaluated. Edit mode always shows the raw tokens.

#### Save payload

`onSave` and `saveAs` receive the same `SavePayload`. The editor renders body HTML and plain text on every save so consumers don't ship the renderer themselves:

```ts
type SavePayload = {
  editorConfig: TEditorConfiguration;   // source of truth
  subject?: string;                     // from the subject input
  variables?: Array<{ name: string; description?: string }>;
  bodyHtml: string;                     // pre-rendered, ready to send
  bodyText: string;                     // pre-rendered, ready to send
};
```

The `renderToStaticMarkup` and `renderToText` utilities are also exposed publicly for consumers that need to re-render outside the save flow (e.g. batch jobs).

#### Image upload and library (BYO backend)

The editor delegates image storage to the consumer through three optional callbacks. When omitted, the corresponding UI is hidden and URL paste remains the fallback.

```ts
type UploadedImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type LibraryImage = UploadedImage & {
  thumbnailUrl?: string;
  uploadedAt?: string;
};
```

- **`uploadImage(file)`** — receives a single `File`, uploads it (S3, R2, Bunny, presigned PUT, etc.), and returns the public `url` plus optional intrinsic dimensions and alt text. Wires up: the Upload button in the Image inspector, drag-and-drop of an image file onto the canvas, and paste-image-from-clipboard.
- **`loadImages()`** — returns the consumer's image list for the "Library" picker dialog (grid + filter by alt/URL).
- **`deleteImage(url)`** — removes an image from the library; surfaces a delete button on hover in the picker.

Reference upload handler:

```ts
const uploadImage = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/images', { method: 'POST', body: form });
  return res.json(); // { url, width, height }
};
```

Newly uploaded images get their `width` / `height` set on the resulting Image block — important for Outlook, which needs explicit dimensions to lay the email out before images load.

| `theme` | object | theme.ts | Custom theme for the EmailEditor, must be a Material UI theme object |

#### Imperative API

You can access the EmailEditor's methods using a ref:

```jsx
import { EmailEditor } from 'kontakto-email-editor';
import { useRef } from 'react';

function MyApp() {
  const editorRef = useRef(null);
  
  const handleSave = () => {
    const template = editorRef.current.saveTemplate();
    console.log('Saved template:', template);
  };
  
  const handleLoad = (template) => {
    editorRef.current.loadTemplate(template);
  };
  
  const handleGetCurrent = () => {
    const current = editorRef.current.getTemplate();
    console.log('Current template:', current);
  };
  
  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleGetCurrent}>Get Current</button>
      <EmailEditor ref={editorRef} minHeight="600px" />
    </div>
  );
}
```

### Stand-alone version using Vite

This project includes a standalone version that can be run using Vite:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

This will start a development server with the EmailEditor running as a standalone application that uses browsers local storage to save and load templates.

## Theming

The EmailEditor component has the CssBaseline and ThemeProvider components from Material UI applied by default. However, if you need to supply a custom theme, you can do so by passing a custom theme to the EmailEditor component. The theme should be a Material UI theme object.


## Development

To run this locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Visit http://localhost:5173/ in your browser

## Project Structure

- `src/blocks/` - Email components (text, images, buttons, etc.)
- `src/editor/` - Core editor functionality
- `src/app/` - Main application components
- `src/email-builder/` - Email template rendering
- `src/core/` - Core utilities and types

## Technologies

- React
- TypeScript
- Material UI
- Zustand for state management
- Vite as the build tool
- Marked and Highlight.js for markdown and code highlighting

# Email-Template-Editor

Licensed under the MIT License. See `LICENSE` for details.

This project, Email-Template-Editor, is a substantial derivative work based on an original MIT-licensed project, `email-builder-js` by Waypoint (Metaccountant, Inc.).  `email-builder-js` is a free and open-source block-based email template builder designed for developers to create emails with JSON or HTML output. While the original code was created by Waypoint, this project has been significantly refactored with:

1.  Restructuring of the project files and directories.
2.  Implementation of how external context is handled.
3.  Changes to the purpose of the project to be integrated and embedded into other React based projects.

## Original Code from Waypoint (Metaccountant, Inc.)

The following parts (not limited to) of this project are derived from the original MIT-licensed project `email-builder-js` by Waypoint:

*   The parsing logic is based on Waypoint's original block-based parsing approach
*   The concepts for the blocks
*   The concepts for the editor
*   The concepts of the builder

## Acknowledgements

This project gratefully acknowledges the original work by Waypoint (Metaccountant, Inc.) on `email-builder-js` as the foundation upon which this version was built.