const nameClass = require('tailwindcss/lib/util/nameClass').default

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    delay: (modifier, { theme }) => {
      let value = theme.transitionDelay[modifier]

      if (value === undefined) {
        return []
      }

      return {
        [nameClass('delay', modifier)]: { 'transition-delay': value },
      }
    },
  })
}
