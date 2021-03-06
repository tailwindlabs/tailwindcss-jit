const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    'max-h': (modifier, { theme }) => {
      let value = asLength(modifier, theme['maxHeight'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('max-h', modifier)]: { 'max-height': value } }
    },
  })
}
