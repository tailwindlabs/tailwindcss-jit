const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    duration: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.transitionDuration[modifier] === undefined) {
          return []
        }

        return [
          [
            nameClass('duration', modifier),
            { 'transition-duration': theme.transitionDuration[modifier] },
          ],
        ]
      },
    ],
  })
}
