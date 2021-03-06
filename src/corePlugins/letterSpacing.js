const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    tracking: (modifier, { theme }) => {
      let value = asLength(modifier, theme['letterSpacing'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('tracking', modifier)]: { 'letter-spacing': value } }
    },
  })
}
