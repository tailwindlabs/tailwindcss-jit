const nameClass = require('tailwindcss/lib/util/nameClass').default

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'row-end': (modifier, { theme }) => {
      let value = theme.gridRowEnd[modifier]

      if (value === undefined) {
        return []
      }

      return { [nameClass('row-end', modifier)]: { 'grid-row-end': value } }
    },
  })
}
