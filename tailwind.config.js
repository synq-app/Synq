/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'accent': "#6DFE95",
        'primary-background': "#000000",
        'primary-text': "#ffffff",
        'inverted-text': "#000000",
        'placeholder-text': "#9ca3af",
      },
    }
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-label': {
          'color': "#ffffff",
          'font-size': '14px',
          'line-height': '20px',
          'font-weight': '500',
          'font-family': 'Avenir',
        },
        '.text-body': {
          'color': "#ffffff",
          'font-size': '14px',
          'line-height': '20px',
          'font-weight': '400',
          'font-family': 'Avenir',
        },
        '.text-heading': {
          'color': "#ffffff",
          'font-size': '20px',
          'line-height': '28px',
          'font-weight': '500',
          'font-family': 'Avenir',
        },
        '.text-title': {
          'color': "#ffffff",
          'font-size': '20px',
          'line-height': '28px',
          'font-weight': '500',
          'font-family': 'Avenir',
        },
        '.text-caption': {
          'color': "#9ca3af",
          'font-size': '12px',
          'line-height': '16px',
          'font-weight': '400',
          'font-family': 'Avenir',
        },
        '.text-button': {
          'color': "#ffffff",
          'font-size': '16px',
          'line-height': '20px',
          'font-weight': '600',
          'font-family': 'Avenir',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
