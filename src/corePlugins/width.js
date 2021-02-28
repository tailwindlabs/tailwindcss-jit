const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    w: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.width[modifier] === undefined) {
          return []
        }

        return [[nameClass('w', modifier), { width: theme.width[modifier] }]]
      },
    ],
  })
}
