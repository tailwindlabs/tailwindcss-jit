const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'border-opacity': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderOpacity')
        let value = transformValue(theme.borderOpacity[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('border-opacity', modifier), { '--tw-border-opacity': value }]]
      },
    ],
  })
}
