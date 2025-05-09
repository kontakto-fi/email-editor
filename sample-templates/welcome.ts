import { TEditorConfiguration } from '@editor/core';

const WELCOME: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F2F5F7',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'MODERN_SANS',
      childrenIds: [
        'block-1709571212684',
        'block-1709571228545',
        'block-1709571234315',
        'block-1709571247550',
        'block-1709571258507',
        'block-1709571281151',
        'block-1709571302968',
        'block-1709571282795',
      ],
    },
  },
  'block-1709571212684': {
    type: 'Image',
    data: {
      style: {
        padding: {
          top: 24,
          bottom: 24,
          right: 24,
          left: 24,
        },
      },
      props: {
        url: '{{ logo_url }}',
        alt: '{{ company_name }}',
        linkHref: '{{ website_url }}',
        contentAlignment: 'middle',
      },
    },
  },
  'block-1709571228545': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: {
          top: 0,
          bottom: 16,
          right: 24,
          left: 24,
        },
      },
      props: {
        text: 'Hi {{ name }} 👋,',
      },
    },
  },
  'block-1709571234315': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: {
          top: 0,
          bottom: 16,
          right: 24,
          left: 24,
        },
      },
      props: {
        text: 'Welcome to {{ company_name }}! {{ company_description }}',
      },
    },
  },
  'block-1709571247550': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: {
          top: 0,
          bottom: 16,
          right: 24,
          left: 24,
        },
      },
      props: {
        text: '{{ benefit_text }}',
      },
    },
  },
  'block-1709571258507': {
    type: 'Image',
    data: {
      style: {
        padding: {
          top: 16,
          bottom: 16,
          right: 24,
          left: 24,
        },
      },
      props: {
        url: '{{ feature_image_url }}',
        alt: '{{ feature_image_alt }}',
        linkHref: '{{ feature_link }}',
        contentAlignment: 'middle',
      },
    },
  },
  'block-1709571281151': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: {
          top: 16,
          bottom: 16,
          right: 24,
          left: 24,
        },
      },
      props: {
        text: "If you ever need help, just reply to this email and one of us will get back to you shortly. We're here to help.",
      },
    },
  },
  'block-1709571282795': {
    type: 'Image',
    data: {
      style: {
        padding: {
          top: 16,
          bottom: 40,
          right: 24,
          left: 24,
        },
      },
      props: {
        url: '{{ secondary_image_url }}',
        alt: '{{ secondary_image_alt }}',
        linkHref: null,
        contentAlignment: 'middle',
      },
    },
  },
  'block-1709571302968': {
    type: 'Button',
    data: {
      style: {
        fontSize: 14,
        padding: {
          top: 16,
          bottom: 24,
          right: 24,
          left: 24,
        },
      },
      props: {
        buttonBackgroundColor: '#0079cc',
        buttonStyle: 'rectangle',
        text: '{{ cta_text }}',
        url: '{{ cta_url }}',
      },
    },
  },
};

export default WELCOME;
