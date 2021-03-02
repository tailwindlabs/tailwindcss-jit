const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let transformValue = transformThemeValue('backgroundOpacity')

  addUtilities({
    'bg-opacity': [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.backgroundOpacity)

        if (value === undefined) {
          return []
        }

        return [[nameClass('bg-opacity', modifier), { '--tw-bg-opacity': value }]]
      },
    ],
  })
}
