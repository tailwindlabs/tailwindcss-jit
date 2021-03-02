const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asAngle } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'skew-x': [
      (modifier, { theme }) => {
        let value = asAngle(modifier, theme.skew)

        if (value === undefined) {
          return []
        }

        return [[nameClass('skew-x', modifier), { '--tw-skew-x': value }]]
      },
    ],
    'skew-y': [
      (modifier, { theme }) => {
        let value = asAngle(modifier, theme.skew)

        if (value === undefined) {
          return []
        }

        return [[nameClass('skew-y', modifier), { '--tw-skew-y': value }]]
      },
    ],
  })
}
