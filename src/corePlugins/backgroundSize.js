const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    bg: (modifier, { theme }) => {
      let value = theme.backgroundSize[modifier]
      if (value === undefined) {
        return []
      }

      return { [nameClass('bg', modifier)]: { 'background-size': value } }
    },
  })
}
