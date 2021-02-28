const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'skew-x': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('skew')
        let value = transformValue(theme.skew[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('skew-x', modifier), { '--tw-skew-x': value }]]
      },
    ],
    'skew-y': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('skew')
        let value = transformValue(theme.skew[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('skew-y', modifier), { '--tw-skew-y': value }]]
      },
    ],
  })
}
