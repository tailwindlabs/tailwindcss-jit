const { nameClass, asValue } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    delay: (modifier, { theme }) => {
      let value = asValue(modifier, theme.transitionDelay)

      if (value === undefined) {
        return []
      }

      return { [nameClass('delay', modifier)]: { 'transition-delay': value } }
    },
  })
}
