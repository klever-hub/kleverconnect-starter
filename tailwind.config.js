/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'klever-pink': '#ff3b9d',
        'klever-purple': '#8b5cf6',
      },
      backgroundImage: {
        'klever-gradient': 'linear-gradient(135deg, #ff3b9d 0%, #8b5cf6 100%)',
        'playground-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease',
        'fade-in-up': 'fade-in-up 0.2s ease',
      },
    },
  },
  plugins: [],
};
