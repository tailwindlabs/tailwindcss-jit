const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    tracking: [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['letterSpacing'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('tracking', modifier), { 'letter-spacing': value }]]
      },
    ],
  })
}
