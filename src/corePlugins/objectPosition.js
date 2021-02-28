const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    object: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.objectPosition[modifier] === undefined) {
          return []
        }

        return [
          [nameClass('object', modifier), { 'object-position': theme.objectPosition[modifier] }],
        ]
      },
    ],
  })
}
