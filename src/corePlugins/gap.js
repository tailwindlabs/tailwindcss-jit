const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    gap: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gap')
        let value = transformValue(theme.gap[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('gap', modifier), { gap: value }]]
      },
    ],
  })
  addUtilities({
    'gap-x': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gap')
        let value = transformValue(theme.gap[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('gap-x', modifier), { 'column-gap': value }]]
      },
    ],
    'gap-y': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('gap')
        let value = transformValue(theme.gap[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('gap-y', modifier), { 'row-gap': value }]]
      },
    ],
  })
}
