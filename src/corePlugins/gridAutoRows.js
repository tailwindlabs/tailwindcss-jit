const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asList } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'auto-rows': [
      (modifier, { theme }) => {
        let value = asList(modifier, theme.gridAutoRows)

        if (value === undefined) {
          return []
        }

        return [[nameClass('auto-rows', modifier), { 'grid-auto-rows': value }]]
      },
    ],
  })
}
