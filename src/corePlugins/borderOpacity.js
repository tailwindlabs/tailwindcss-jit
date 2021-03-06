const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'border-opacity': (modifier, { theme }) => {
      let value = asValue(modifier, theme.borderOpacity)

      if (value === undefined) {
        return []
      }

      return { [nameClass('border-opacity', modifier)]: { '--tw-border-opacity': value } }
    },
  })
}
