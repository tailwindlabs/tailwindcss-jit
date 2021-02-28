const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    opacity: (modifier, { theme }) => {
      if (modifier === '' || theme.opacity[modifier] === undefined) {
        return []
      }

      return [[nameClass('opacity', modifier), { opacity: theme.opacity[modifier] }]]
    },
  })
}
