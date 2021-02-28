const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'flex-grow': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('flexGrow')
        let value = transformValue(theme.flexGrow[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('flex-grow', modifier), { 'flex-grow': value }]]
      },
    ],
  })
}
