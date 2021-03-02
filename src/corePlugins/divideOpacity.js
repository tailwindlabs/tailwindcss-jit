const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'divide-opacity': [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.divideOpacity)

        if (value === undefined) {
          return []
        }

        return [
          [
            `${nameClass('divide-opacity', modifier)} > :not([hidden]) ~ :not([hidden])`,
            { '--tw-divide-opacity': value },
          ],
        ]
      },
    ],
  })
}
