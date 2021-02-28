const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    h: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.height[modifier] === undefined) {
          return []
        }

        return [[nameClass('h', modifier), { height: theme.height[modifier] }]]
      },
    ],
  })
}
