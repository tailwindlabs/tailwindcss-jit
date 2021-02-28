const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'grid-rows': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridTemplateRows')
        let value = transformValue(theme.gridTemplateRows[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('grid-rows', modifier), { 'grid-template-rows': value }]]
      },
    ],
  })
}
