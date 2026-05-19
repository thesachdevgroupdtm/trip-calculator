import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Toyota brand colors
        toyota: {
          red: '#EB0A1E',
          'red-dark': '#C8081A',
          black: '#0A0A0B',
          silver: '#C7CCD1',
          'silver-dark': '#8B919A',
        },
        galaxy: {
          50: '#F4F6FB',
          100: '#E6EBF5',
          200: '#C9D3E8',
          300: '#9DAFD3',
          400: '#6B83B8',
          500: '#4A639E',
          600: '#374D82',
          700: '#2D3F6A',
          800: '#202D4D',
          900: '#141B30',
          950: '#0A0E1C',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      backgroundImage: {
        'gradient-toyota': 'linear-gradient(135deg, #EB0A1E 0%, #8B0000 100%)',
        'gradient-galaxy': 'linear-gradient(135deg, #0A0E1C 0%, #2D3F6A 50%, #4A639E 100%)',
        'gradient-premium': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gradient-light': 'linear-gradient(135deg, #F4F6FB 0%, #E6EBF5 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-aurora': 'radial-gradient(at 40% 20%, rgba(235,10,30,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(74,99,158,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(45,63,106,0.15) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(235, 10, 30, 0.35)',
        'glow-blue': '0 0 40px rgba(74, 99, 158, 0.35)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'premium': '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 18px 36px -18px rgba(0, 0, 0, 0.22)',
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(235, 10, 30, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(235, 10, 30, 0.7)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
