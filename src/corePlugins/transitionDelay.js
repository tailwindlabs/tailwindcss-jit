const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    delay: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.transitionDelay[modifier] === undefined) {
          return []
        }

        return [
          [nameClass('delay', modifier), { 'transition-delay': theme.transitionDelay[modifier] }],
        ]
      },
    ],
  })
}
