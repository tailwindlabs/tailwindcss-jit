const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

function isPlainObject(value) {
  return typeof value === 'object' && value !== null
}

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    outline: (modifier, { theme }) => {
      let transformValue = transformThemeValue('outline')
      let value = transformValue(theme.outline[modifier])

      if (modifier === '' || value === undefined) {
        return []
      }

      let [outline, outlineOffset = '0'] = Array.isArray(value) ? value : [value]

      return {
        [nameClass('outline', modifier)]: {
          outline,
          'outline-offset': outlineOffset,
        },
      }
    },
  })
}
