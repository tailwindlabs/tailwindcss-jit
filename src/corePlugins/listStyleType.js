const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    list: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.listStyleType[modifier] === undefined) {
          return []
        }

        return [[nameClass('list', modifier), { 'list-style-type': theme.listStyleType[modifier] }]]
      },
    ],
  })
}
