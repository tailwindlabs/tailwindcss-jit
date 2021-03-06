const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    stroke: (modifier, { theme }) => {
      let value = asLength(modifier, theme['strokeWidth'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('stroke', modifier)]: { 'stroke-width': value } }
    },
  })
}
