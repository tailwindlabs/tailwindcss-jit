const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    origin: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.transformOrigin[modifier] === undefined) {
          return []
        }

        return [
          [nameClass('origin', modifier), { 'transform-origin': theme.transformOrigin[modifier] }],
        ]
      },
    ],
  })
}
