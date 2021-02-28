const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'row-end': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridRowEnd')
        let value = transformValue(theme.gridRowEnd[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('row-end', modifier), { 'grid-row-end': value }]]
      },
    ],
  })
}
