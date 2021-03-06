const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    w: (modifier, { theme }) => {
      let value = asLength(modifier, theme['width'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('w', modifier)]: { width: value } }
    },
  })
}
