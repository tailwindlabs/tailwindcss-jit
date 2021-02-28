const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    z: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.zIndex[modifier] === undefined) {
          return []
        }

        return [[nameClass('z', modifier), { 'z-index': theme.zIndex[modifier] }]]
      },
    ],
  })
}
