const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    leading: [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['lineHeight'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('leading', modifier), { 'line-height': value }]]
      },
    ],
  })
}
