const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    cursor: [
      (modifier, { theme }) => {
        if (modifier === undefined || modifier === '' || theme.cursor[modifier] === undefined) {
          return []
        }

        return [[nameClass('cursor', modifier), { cursor: theme.cursor[modifier] }]]
      },
    ],
  })
}
