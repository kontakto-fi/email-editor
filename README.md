# Kontakto Email Editor

A React-based email template editor component that allows users to create and customize email templates through a visual interface. This component can be embedded in any React application.

## Overview

Kontakto Email Editor is a comprehensive solution for creating email templates with a drag-and-drop interface. It's built as a reusable React component that can be easily integrated into your applications.

## Features

- Visual email template builder
- Rich set of components (text, buttons, images, dividers, containers, columns, etc.)
- Markdown support for text editing
- Responsive email templates
- Customizable themes
- Export to HTML

## Installation

```bash
npm install kontakto-email-editor
```

## Usage

```jsx
import React, { useRef } from 'react';
import { EmailEditor } from 'kontakto-email-editor';

const MyApp = () => {
  const editorRef = useRef(null);

  const saveTemplate = () => {
    const template = editorRef.current.saveTemplate();
    console.log('Template saved', template);
  };

  return (
    <div>
      <button onClick={saveTemplate}>Save Template</button>
      <EmailEditor 
        ref={editorRef}
        onSave={(template) => console.log('Template saved', template)}
        onChange={(template) => console.log('Template changed', template)}
      />
    </div>
  );
};
```

## Theming

The EmailEditor component does not include its own ThemeProvider, allowing you to integrate it with your application's theme. To apply a theme to the EmailEditor, wrap it with MUI's ThemeProvider:

```jsx
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { EmailEditor } from 'kontakto-email-editor';
import { createTheme } from '@mui/material/styles';

// Create your custom theme or import it
const theme = createTheme({
  // Your theme options
});

const MyApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EmailEditor />
    </ThemeProvider>
  );
};
```

For reference, you can copy the default theme implementation from the `src/theme.ts` file in the package and customize it according to your application's design system.

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
- `src/configuration/` - Configuration options

## Technologies

- React
- TypeScript
- Material UI
- Zustand for state management
- Vite as the build tool
- Marked and Highlight.js for markdown and code highlighting

# Kontakto-Email-Editor

Licensed under the MIT License. See `LICENSE` for details.

This project, Kontakto-Email-Editor, is a substantial derivative work based on an original MIT-licensed project, `email-builder-js` by Waypoint (Metaccountant, Inc.).  `email-builder-js` is a free and open-source block-based email template builder designed for developers to create emails with JSON or HTML output. While the original code was created by Waypoint, this project has been significantly refactored with:

1.  Complete restructuring of the project files and directories.
2.  Implementation of how external context is handled.
3.  Changes to the core purpose - from a standalone email builder to an embeddable email editor component for React projects.

## Original Code from Waypoint (Metaccountant, Inc.)

The following parts of this project are derived from the original MIT-licensed project `email-builder-js` by Waypoint:

*   The core parsing logic is based on Waypoint's original block-based parsing approach
*   The initial concepts for the block structure of the email content

## New Code and Modifications by Kontakto Oy

The following parts of this project are entirely new or represent significant modifications by Kontakto Oy:

*  Kontakto significantly restructured the project, so it is now embeddable email editor component as a single NPM package, rather than a set of multiple NPM packages.
*  External context handling mechanism has been implemented.
*  The core purpose of the project has been changed from a standalone email builder to an embeddable email editor component for React projects.

## Acknowledgements

This project gratefully acknowledges the original work by Waypoint (Metaccountant, Inc.) on `email-builder-js` as the foundation upon which this enhanced and refactored version was built. Without their initial effort in creating `email-builder-js`, this project would not have been possible.