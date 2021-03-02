const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    gap: [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['gap'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('gap', modifier), { gap: value }]]
      },
    ],
  })
  addUtilities({
    'gap-x': [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['gap'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('gap-x', modifier), { 'column-gap': value }]]
      },
    ],
    'gap-y': [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['gap'])

        if (value === undefined) {
          return []
        }

        return [[nameClass('gap-y', modifier), { 'row-gap': value }]]
      },
    ],
  })
}
