const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    cursor: [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.cursor)

        if (value === undefined) {
          return []
        }

        return [[nameClass('cursor', modifier), { cursor: value }]]
      },
    ],
  })
}
