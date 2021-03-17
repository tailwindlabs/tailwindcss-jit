const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asLength, nameClass } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'min-w': (modifier, { theme }) => {
      let value = asLength(modifier, theme['minWidth'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('min-w', modifier)]: { 'min-width': value } }
    },
  })
}
