const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asList } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'grid-cols': (modifier, { theme }) => {
      let value = asList(modifier, theme.gridTemplateColumns)

      if (value === undefined) {
        return []
      }

      return { [nameClass('grid-cols', modifier)]: { 'grid-template-columns': value } }
    },
  })
}
