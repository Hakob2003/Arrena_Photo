import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Force dark mode manually using classes
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        indigo: {
          300: 'rgb(var(--color-accent-300) / <alpha-value>)',
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-y': {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        'neon-shimmer': {
          '0%, 100%': { opacity: '1', transform: 'translate(0, 0) scale(1)' },
          '25%': { opacity: '0.3', transform: 'translate(3%, 3%) scale(1.1)' },
          '50%': { opacity: '0.8', transform: 'translate(-2%, -2%) scale(0.95)' },
          '75%': { opacity: '0.2', transform: 'translate(-3%, 2%) scale(1.05)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon-shimmer-1': 'neon-shimmer 13s ease-in-out infinite',
        'neon-shimmer-2': 'neon-shimmer 17s ease-in-out infinite alternate-reverse',
        'neon-shimmer-3': 'neon-shimmer 23s ease-in-out infinite',
        'neon-shimmer-4': 'neon-shimmer 19s ease-in-out infinite alternate-reverse',
      },
    },
  },
  plugins: [],
};
export default config;
