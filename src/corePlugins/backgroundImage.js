const nameClass = require('tailwindcss/lib/util/nameClass').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    bg: [
      (modifier, { theme }) => {
        let value = theme.backgroundImage[modifier]

        if (value === undefined) {
          return []
        }

        return [[nameClass('bg', modifier), { 'background-image': value }]]
      },
    ],
  })
}
