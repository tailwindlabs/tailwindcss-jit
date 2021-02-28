const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'min-w': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('minWidth')
        let value = transformValue(theme.minWidth[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('min-w', modifier), { 'min-width': value }]]
      },
    ],
  })
}
