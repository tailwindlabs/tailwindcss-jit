const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'flex-shrink': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('flexShrink')
        let value = transformValue(theme.flexShrink[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('flex-shrink', modifier), { 'flex-shrink': value }]]
      },
    ],
  })
}
