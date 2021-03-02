const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    h: [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['height'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('h', modifier), { height: value }]]
      },
    ],
  })
}
