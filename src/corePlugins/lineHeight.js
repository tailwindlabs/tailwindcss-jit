const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    leading: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.lineHeight[modifier] === undefined) {
          return []
        }

        return [[nameClass('leading', modifier), { 'line-height': theme.lineHeight[modifier] }]]
      },
    ],
  })
}
