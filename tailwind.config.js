/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent-base': 'var(--cyan-1)',
        'accent-bg-subtle': 'var(--cyan-2)',
        'accent-bg': 'var(--cyan-3)',
        'accent-bg-hover': 'var(--cyan-4)',
        'accent-bg-active': 'var(--cyan-5)',
        'accent-line': 'var(--cyan-6)',
        'accent-border': 'var(--cyan-7)',
        'accent-border-hover': 'var(--cyan-8)',
        'accent-solid': 'var(--cyan-9)',
        'accent-solid-hover': 'var(--cyan-10)',
        'accent-text': 'var(--cyan-11)',
        'accent-text-contrast': 'var(--cyan-12)',

        'primary-base': 'var(--slate-1)',
        'primary-bg-subtle': 'var(--slate-2)',
        'primary-bg': 'var(--slate-3)',
        'primary-bg-hover': 'var(--slate-4)',
        'primary-bg-active': 'var(--slate-5)',
        'primary-line': 'var(--slate-6)',
        'primary-border': 'var(--slate-7)',
        'primary-border-hover': 'var(--slate-8)',
        'primary-solid': 'var(--slate-9)',
        'primary-solid-hover': 'var(--slate-10)',
        'primary-text': 'var(--slate-11)',
        'primary-text-contrast': 'var(--slate-12)',
      },
    },
  },
  plugins: [],
};
