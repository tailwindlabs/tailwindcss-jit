const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asList } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'auto-cols': [
      (modifier, { theme }) => {
        let value = asList(modifier, theme.gridAutoColumns)

        if (value === undefined) {
          return []
        }

        return [[nameClass('auto-cols', modifier), { 'grid-auto-columns': value }]]
      },
    ],
  })
}
