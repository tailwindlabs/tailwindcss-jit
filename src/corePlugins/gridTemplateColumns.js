const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'grid-cols': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridTemplateColumns')
        let value = transformValue(theme.gridTemplateColumns[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('grid-cols', modifier), { 'grid-template-columns': value }]]
      },
    ],
  })
}
