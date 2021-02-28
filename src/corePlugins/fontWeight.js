const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    font: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.fontWeight[modifier] === undefined) {
          return []
        }

        return [[nameClass('font', modifier), { 'font-weight': theme.fontWeight[modifier] }]]
      },
    ],
  })
}
