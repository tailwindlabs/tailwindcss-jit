const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    row: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.gridRow[modifier] === undefined) {
          return []
        }

        return [[nameClass('row', modifier), { 'grid-row': theme.gridRow[modifier] }]]
      },
    ],
  })
}
