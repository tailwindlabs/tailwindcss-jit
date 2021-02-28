const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    bg: [
      (modifier, { theme }) => {
        let value = theme.backgroundPosition[modifier]

        if (value === undefined) {
          return []
        }

        return [[nameClass('bg', modifier), { 'background-position': value }]]
      },
    ],
  })
}
