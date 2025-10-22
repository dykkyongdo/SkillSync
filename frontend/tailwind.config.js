/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'secondary-background': 'var(--secondary-background)',
        foreground: 'var(--foreground)',
        'main-foreground': 'var(--main-foreground)',
        main: 'var(--main)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        overlay: 'var(--overlay)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'chart-active-dot': 'var(--chart-active-dot)',
      },
      boxShadow: {
        'shadow': 'var(--shadow)',
      },
      borderRadius: {
        'base': '5px',
      },
      fontFamily: {
        'base': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'heading': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'base': '500',
        'heading': '700',
      },
      spacing: {
        'boxShadowX': '4px',
        'boxShadowY': '4px',
        'reverseBoxShadowX': '-4px',
        'reverseBoxShadowY': '-4px',
      },
    },
  },
  plugins: [],
}
