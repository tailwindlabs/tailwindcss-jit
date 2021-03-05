const nameClass = require('tailwindcss/lib/util/nameClass').default
const { newFormat } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    bg: [
      newFormat((modifier, { theme }) => {
        let value = theme.backgroundImage[modifier]

        if (value === undefined) {
          return []
        }

        return { [nameClass('bg', modifier)]: { 'background-image': value } }
      }),
    ],
  })
}
