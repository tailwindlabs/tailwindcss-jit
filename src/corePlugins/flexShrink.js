const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asValue } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'flex-shrink': [
      (modifier, { theme }) => {
        let value = asValue(modifier, theme.flexShrink)

        if (value === undefined) {
          return []
        }

        return [[nameClass('flex-shrink', modifier), { 'flex-shrink': value }]]
      },
    ],
  })
}
