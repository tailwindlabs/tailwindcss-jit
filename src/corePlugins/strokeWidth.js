const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    stroke: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.strokeWidth[modifier] === undefined) {
          return []
        }

        return [[nameClass('stroke', modifier), { 'stroke-width': theme.strokeWidth[modifier] }]]
      },
    ],
  })
}
