const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'row-start': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridRowStart')
        let value = transformValue(theme.gridRowStart[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('row-start', modifier), { 'grid-row-start': value }]]
      },
    ],
  })
}
