const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    rotate: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('rotate')
        let value = transformValue(theme.rotate[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('rotate', modifier), { '--tw-rotate': value }]]
      },
    ],
  })
}
