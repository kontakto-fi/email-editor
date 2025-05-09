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
| `onSave` | function | - | Callback when template is saved: `(template) => void` |
| `onChange` | function | - | Callback when template changes: `(template) => void` |
| `loadSamples` | function | - | Loads sample templates: `() => Promise<SampleTemplate[]>` |
| `loadTemplates` | function | - | Loads user templates: `() => Promise<SampleTemplate[]>` |
| `loadTemplate` | function | - | Loads specific template: `(id) => Promise<Template>` |
| `deleteTemplate` | function | - | Deletes a template: `(id) => void` |
| `copyTemplate` | function | - | Copies a template: `(name, content) => void` |
| `saveAs` | function | - | Saves template with new name: `(name, content) => Promise<{id, name}>` |
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