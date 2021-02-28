const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'col-end': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridColumnEnd')
        let value = transformValue(theme.gridColumnEnd[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('col-end', modifier), { 'grid-column-end': value }]]
      },
    ],
  })
}
