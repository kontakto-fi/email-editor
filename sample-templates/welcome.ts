import { TEditorConfiguration } from '@editor/core';

const WELCOME: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F2F5F7',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'MODERN_SANS',
      subject: 'Welcome to Acme — let’s get you set up',
      variables: [
        {
          name: 'first_name',
          description: 'Recipient’s first name',
          sampleValue: 'Alice',
        },
      ],
      childrenIds: [
        'welcome-logo',
        'welcome-greeting',
        'welcome-intro',
        'welcome-list',
        'welcome-cta',
        'welcome-help',
        'welcome-signature',
      ],
    },
  },
  'welcome-logo': {
    type: 'Image',
    data: {
      style: {
        padding: { top: 24, bottom: 24, right: 24, left: 24 },
        textAlign: 'left',
      },
      props: {
        width: 120,
        height: 32,
        url: 'https://placehold.co/240x64/0068FF/FFFFFF/png?text=Acme',
        alt: 'Acme',
        linkHref: 'https://acme.example',
        contentAlignment: 'middle',
      },
    },
  },
  'welcome-greeting': {
    type: 'Heading',
    data: {
      style: {
        textAlign: 'left',
        padding: { top: 16, bottom: 8, right: 24, left: 24 },
      },
      props: {
        level: 'h2',
        text: 'Hi {{first_name}} 👋 — welcome aboard',
      },
    },
  },
  'welcome-intro': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: { top: 0, bottom: 16, right: 24, left: 24 },
      },
      props: {
        text:
          'We’re glad to have you at Acme. You now have everything you need to build, preview, and send emails that actually reach the inbox — without pasting HTML into five different tabs.',
        markdown: false,
      },
    },
  },
  'welcome-list': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: { top: 0, bottom: 16, right: 24, left: 24 },
      },
      props: {
        markdown: true,
        text:
          '**Here’s where to start:**\n\n' +
          '- Open a sample template and make it yours\n' +
          '- Preview in desktop and mobile before you send\n' +
          '- Save a template once, reuse it forever',
      },
    },
  },
  'welcome-cta': {
    type: 'Button',
    data: {
      style: {
        fontSize: 14,
        textAlign: 'left',
        padding: { top: 8, bottom: 24, right: 24, left: 24 },
      },
      props: {
        buttonBackgroundColor: '#0068FF',
        buttonTextColor: '#FFFFFF',
        buttonStyle: 'rectangle',
        fullWidth: false,
        size: 'medium',
        text: 'Open your dashboard',
        url: 'https://acme.example/dashboard',
      },
    },
  },
  'welcome-help': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: { top: 8, bottom: 16, right: 24, left: 24 },
      },
      props: {
        text:
          'If you ever need a hand, just reply to this email — a real person on our team will write back.',
        markdown: false,
      },
    },
  },
  'welcome-signature': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: { top: 8, bottom: 32, right: 24, left: 24 },
      },
      props: {
        text: '— The Acme team',
        markdown: false,
      },
    },
  },
};

export default WELCOME;
