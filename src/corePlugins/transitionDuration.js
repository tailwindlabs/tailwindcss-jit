const nameClass = require('tailwindcss/lib/util/nameClass').default

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    duration: (modifier, { theme }) => {
      let value = theme.transitionDuration[modifier]

      if (value === undefined) {
        return []
      }

      return { [nameClass('duration', modifier)]: { 'transition-duration': value } }
    },
  })
}
