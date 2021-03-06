const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'flex-grow': (modifier, { theme }) => {
      let value = asValue(modifier, theme.flexGrow)

      if (value === undefined) {
        return []
      }

      return { [nameClass('flex-grow', modifier)]: { 'flex-grow': value } }
    },
  })
}
