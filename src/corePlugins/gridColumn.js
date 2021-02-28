const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    col: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.gridColumn[modifier] === undefined) {
          return []
        }

        return [[nameClass('col', modifier), { 'grid-column': theme.gridColumn[modifier] }]]
      },
    ],
  })
}
