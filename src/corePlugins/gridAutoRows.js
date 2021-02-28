const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'auto-rows': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gridAutoRows')
        let value = transformValue(theme.gridAutoRows[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('auto-rows', modifier), { 'grid-auto-rows': value }]]
      },
    ],
  })
}
