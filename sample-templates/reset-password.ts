import { TEditorConfiguration } from '@editor/core';

const RESET_PASSWORD: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F2F5F7',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'MODERN_SANS',
      subject: 'Reset your Acme password',
      variables: [
        {
          name: 'first_name',
          description: 'Recipient’s first name',
          sampleValue: 'Alice',
        },
        {
          name: 'reset_url',
          description: 'One-time password reset link (expires in 30 minutes)',
          sampleValue: 'https://acme.example/reset?token=sample-token',
        },
      ],
      childrenIds: [
        'reset-logo',
        'reset-heading',
        'reset-body',
        'reset-cta',
        'reset-divider',
        'reset-footer',
      ],
    },
  },
  'reset-logo': {
    type: 'Image',
    data: {
      style: {
        padding: { top: 24, bottom: 8, right: 24, left: 24 },
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
  'reset-heading': {
    type: 'Heading',
    data: {
      style: {
        fontWeight: 'bold',
        textAlign: 'left',
        padding: { top: 32, bottom: 0, left: 24, right: 24 },
      },
      props: {
        level: 'h3',
        text: 'Reset your password',
      },
    },
  },
  'reset-body': {
    type: 'Text',
    data: {
      style: {
        color: '#474849',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        padding: { top: 8, bottom: 16, left: 24, right: 24 },
      },
      props: {
        markdown: false,
        text:
          'Hi {{first_name}}, we got a request to reset the password on your Acme account. Click the button below to set a new one. If you didn’t ask for this, you can ignore this email — your password won’t change.',
      },
    },
  },
  'reset-cta': {
    type: 'Button',
    data: {
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'left',
        padding: { top: 12, bottom: 32, right: 24, left: 24 },
      },
      props: {
        buttonBackgroundColor: '#0068FF',
        buttonTextColor: '#FFFFFF',
        buttonStyle: 'rectangle',
        fullWidth: false,
        size: 'medium',
        text: 'Reset password',
        url: '{{reset_url}}',
      },
    },
  },
  'reset-divider': {
    type: 'Divider',
    data: {
      style: {
        padding: { top: 16, bottom: 16, left: 24, right: 24 },
      },
      props: {
        lineColor: '#EEEEEE',
      },
    },
  },
  'reset-footer': {
    type: 'Text',
    data: {
      style: {
        color: '#8a8d91',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        padding: { top: 4, bottom: 24, left: 24, right: 24 },
      },
      props: {
        markdown: false,
        text:
          'For security, this link expires in 30 minutes and can only be used once. If you need a new link, head to acme.example and choose “Forgot password” again.',
      },
    },
  },
};

export default RESET_PASSWORD;
