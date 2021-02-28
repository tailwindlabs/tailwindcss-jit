const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'divide-opacity': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('divideOpacity')
        let value = transformValue(theme.divideOpacity[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            `${nameClass('divide-opacity', modifier)} > :not([hidden]) ~ :not([hidden])`,
            { '--tw-divide-opacity': theme.divideOpacity[modifier] },
          ],
        ]
      },
    ],
  })
}
