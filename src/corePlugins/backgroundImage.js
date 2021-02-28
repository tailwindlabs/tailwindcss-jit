const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let transformValue = transformThemeValue('backgroundImage')
  addUtilities({
    bg: [
      (modifier, { theme }) => {
        let value = transformValue(theme.backgroundImage[modifier])

        if (value === undefined) {
          return []
        }

        return [[nameClass('bg', modifier), { 'background-image': value }]]
      },
    ],
  })
}
