const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'max-w': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('maxWidth')
        let value = transformValue(theme.maxWidth[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('max-w', modifier), { 'max-width': value }]]
      },
    ],
  })
}
