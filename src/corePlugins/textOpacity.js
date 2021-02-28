const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'text-opacity': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('textOpacity')
        let value = transformValue(theme.textOpacity[modifier])

        if (theme.textOpacity[modifier] === undefined) {
          return []
        }

        return [
          [
            nameClass('text-opacity', modifier),
            { '--tw-text-opacity': theme.textOpacity[modifier] },
          ],
        ]
      },
    ],
  })
}
