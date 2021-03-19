const { asValue, nameClass } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    h: (modifier, { theme }) => {
      let value = asValue(modifier, theme['height'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('h', modifier)]: { height: value } }
    },
  })
}
