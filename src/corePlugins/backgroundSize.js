const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    bg: [
      (modifier, { theme }) => {
        if (
          modifier === undefined ||
          modifier === '' ||
          theme.backgroundSize[modifier] === undefined
        ) {
          return []
        }

        return [[nameClass('bg', modifier), { 'background-size': theme.backgroundSize[modifier] }]]
      },
    ],
  })
}
