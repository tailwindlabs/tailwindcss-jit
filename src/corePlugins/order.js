const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    order: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.order[modifier] === undefined) {
          return []
        }

        return [[nameClass('order', modifier), { order: theme.order[modifier] }]]
      },
    ],
  })
}
