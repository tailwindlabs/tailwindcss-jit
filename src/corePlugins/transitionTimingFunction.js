const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    ease: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.transitionTimingFunction[modifier] === undefined) {
          return []
        }

        return [
          [
            nameClass('ease', modifier),
            { 'transition-timing-function': theme.transitionTimingFunction[modifier] },
          ],
        ]
      },
    ],
  })
}
