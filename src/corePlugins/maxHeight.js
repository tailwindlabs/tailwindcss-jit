const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'max-h': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('maxHeight')
        let value = transformValue(theme.maxHeight[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('max-h', modifier), { 'max-height': value }]]
      },
    ],
  })
}
