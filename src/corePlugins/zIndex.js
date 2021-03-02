const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    z: [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.scale)

        if (value === undefined) {
          return []
        }

        return [[nameClass('z', modifier), { 'z-index': value }]]
      },
    ],
  })
}
