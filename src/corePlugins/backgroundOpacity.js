const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let transformValue = transformThemeValue('backgroundOpacity')

  addUtilities({
    'bg-opacity': [
      (modifier, { theme }) => {
        let value = transformValue(theme.backgroundOpacity[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            nameClass('bg-opacity', modifier),
            { '--tw-bg-opacity': theme.backgroundOpacity[modifier] },
          ],
        ]
      },
    ],
  })
}
