const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    flex: [
      (modifier, { theme }) => {
        if (modifier === undefined || modifier === '' || theme.flex[modifier] === undefined) {
          return []
        }

        return [[nameClass('flex', modifier), { flex: theme.flex[modifier] }]]
      },
    ],
  })
}
