const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'min-h': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('minHeight')
        let value = transformValue(theme.minHeight[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('min-h', modifier), { 'min-height': value }]]
      },
    ],
  })
}
