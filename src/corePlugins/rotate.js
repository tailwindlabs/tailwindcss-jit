const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asAngle } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    rotate: [
      (modifier, { theme }) => {
        let value = asAngle(modifier, theme.rotate)

        if (value === undefined) {
          return []
        }

        return [[nameClass('rotate', modifier), { '--tw-rotate': value }]]
      },
    ],
  })
}
