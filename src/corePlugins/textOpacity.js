const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'text-opacity': [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.textOpacity)

        if (value === undefined) {
          return []
        }

        return [[nameClass('text-opacity', modifier), { '--tw-text-opacity': value }]]
      },
    ],
  })
}
