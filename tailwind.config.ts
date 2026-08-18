import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
      24: '96px',
      32: '128px',
    },
    fontSize: {
      xs: '14px',
      sm: '16px',
      base: '18px',
      lg: '22px',
      xl: '28px',
      '2xl': '36px',
      '3xl': '46px',
    },
    fontFamily: {
      display: ['var(--font-display)', 'serif'],
      sans: ['var(--font-sans)', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
    borderRadius: {
      none: '0px',
      DEFAULT: '2px',
    },
    extend: {
      colors: {
        night: '#0D0F14',
        graticule: '#1E2430',
        'trail-a': '#F0C05A',
        'trail-b': '#5FB0D9',
        bloom: '#FFF8E8',
        section: '#A78BC4',
        readout: '#B8C2CE',
        // Secondary/label text — #2A313D ("rule") is a border color and
        // fails WCAG contrast (1.47:1) when used as text; this token is for
        // captions, field labels, and nav links that need to be legible.
        caption: '#8B95A3',
        rule: '#2A313D',
      },
      transitionDuration: {
        fast: '120ms',
        state: '240ms',
        clear: '500ms',
      },
      transitionTimingFunction: {
        house: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
