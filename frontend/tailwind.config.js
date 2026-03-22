/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark theme palette
        background: {
          primary: '#0f0f1a',
          secondary: '#1a1a2e',
          tertiary: '#252542',
        },
        accent: {
          primary: '#6366f1',    // Indigo
          secondary: '#8b5cf6',  // Violet
          success: '#10b981',    // Emerald
          warning: '#f59e0b',    // Amber
          danger: '#ef4444',     // Red
          info: '#3b82f6',       // Blue
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        card: {
          DEFAULT: '#1e1e32',
          hover: '#252542',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-card': 'linear-gradient(180deg, #1e1e32 0%, #1a1a2e 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(99, 102, 241, 0.3)',
        'glow-sm': '0 0 20px rgba(99, 102, 241, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
