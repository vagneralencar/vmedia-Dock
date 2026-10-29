/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dock: {
          dark: "rgba(18, 18, 22, 0.65)",
          light: "rgba(255, 255, 255, 0.75)",
          border: "rgba(255, 255, 255, 0.16)",
          active: "#3b82f6",
        }
      },
      backdropBlur: {
        dock: "24px",
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 0.4s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceSubtle: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
