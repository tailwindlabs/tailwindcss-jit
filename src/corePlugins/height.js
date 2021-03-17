const { asLength, nameClass } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    h: (modifier, { theme }) => {
      let value = asLength(modifier, theme['height'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('h', modifier)]: { height: value } }
    },
  })
}
