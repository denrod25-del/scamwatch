import type { Config } from 'tailwindcss';

/**
 * ScamWatch Tailwind theme — implements the Volume 7 (Design System) token map.
 * Components consume SEMANTIC tokens only (color-*, text-*, space-*, radius-*).
 * All semantic colors resolve to CSS variables defined in src/styles/globals.css,
 * so the cyber-dark default + light theme are a single data-attribute toggle.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          contrast: 'var(--color-brand-contrast)',
        },
        accent: 'var(--color-accent)',
        info: { fg: 'var(--color-info-fg)', bg: 'var(--color-info-bg)' },
        safe: {
          fg: 'var(--color-safe-fg)',
          bg: 'var(--color-safe-bg)',
          border: 'var(--color-safe-border)',
        },
        caution: {
          fg: 'var(--color-caution-fg)',
          bg: 'var(--color-caution-bg)',
          border: 'var(--color-caution-border)',
        },
        danger: {
          fg: 'var(--color-danger-fg)',
          bg: 'var(--color-danger-bg)',
          border: 'var(--color-danger-border)',
        },
        focus: 'var(--color-focus)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        mono: 'var(--font-mono)',
        display: 'var(--font-display)',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        sm: ['0.875rem', { lineHeight: '1.55' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.55' }],
        xl: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        '2xl': ['1.5625rem', { lineHeight: '1.3', fontWeight: '600' }],
        '3xl': ['1.9375rem', { lineHeight: '1.25', fontWeight: '700' }],
        '4xl': ['2.4375rem', { lineHeight: '1.2', fontWeight: '700' }],
        '5xl': ['3.0518rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },
      transitionDuration: {
        instant: '80ms',
        fast: '150ms',
        base: '220ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.2,0,0,1)',
        emphasized: 'cubic-bezier(.2,0,0,1)',
        exit: 'cubic-bezier(.4,0,1,1)',
      },
      boxShadow: {
        glow: '0 0 26px -8px rgba(74,222,128,0.5)',
        'glow-strong': '0 0 42px -8px rgba(74,222,128,0.65)',
      },
      maxWidth: {
        prose: '70ch',
      },
      ringColor: {
        focus: 'var(--color-focus)',
      },
    },
  },
  plugins: [],
};

export default config;
