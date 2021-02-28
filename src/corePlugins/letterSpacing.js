const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    tracking: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.letterSpacing[modifier] === undefined) {
          return []
        }

        return [
          [nameClass('tracking', modifier), { 'letter-spacing': theme.letterSpacing[modifier] }],
        ]
      },
    ],
  })
}
