const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'translate-x': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('translate')
        let value = transformValue(theme.translate[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('translate-x', modifier), { '--tw-translate-x': value }]]
      },
    ],
    'translate-y': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('translate')
        let value = transformValue(theme.translate[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('translate-y', modifier), { '--tw-translate-y': value }]]
      },
    ],
  })
}
