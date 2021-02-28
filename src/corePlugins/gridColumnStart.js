const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'col-start': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridColumnStart')
        let value = transformValue(theme.gridColumnStart[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('col-start', modifier), { 'grid-column-start': value }]]
      },
    ],
  })
}
