const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'auto-cols': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridAutoColumns')
        let value = transformValue(theme.gridAutoColumns[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('auto-cols', modifier), { 'grid-auto-columns': value }]]
      },
    ],
  })
}
